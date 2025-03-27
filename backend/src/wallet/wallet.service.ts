import { Injectable, Logger } from '@nestjs/common';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ethUtil from 'ethereumjs-util';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import * as crypto from 'crypto';
import { WebSocket } from 'ws';

/**
 * Service responsible for managing cryptocurrency wallets.
 * Handles wallet creation, balance tracking, and transaction management.
 * Supports both Bitcoin (BTC) and Ethereum (ETH) wallets.
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  // Initialize BIP32 for HD wallet support
  private bip32 = BIP32Factory(ecc);
  // Encryption key for sensitive data, should be set via environment variable
  private readonly encryptionKey =
    process.env.ENCRYPTION_KEY || 'your-secure-encryption-key';
  // Using AES-256-GCM for authenticated encryption
  private readonly encryptionAlgorithm = 'aes-256-gcm';
  // WebSocket connections for real-time blockchain updates
  private btcWs: WebSocket | null = null;
  private ethWs: WebSocket | null = null;

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {
    // Initialize WebSocket connections only if API keys are available
    if (process.env.BLOCKCYPHER_API_KEY || process.env.INFURA_API_KEY) {
      this.initializeWebSockets();
    } else {
      this.logger.warn(
        'WebSocket connections not initialized: Missing API keys',
      );
    }
  }

  /**
   * Initializes WebSocket connections for real-time blockchain updates.
   * Connects to BlockCypher for Bitcoin and Infura for Ethereum.
   */
  private initializeWebSockets() {
    try {
      // Initialize Bitcoin WebSocket only if API key is available
      if (process.env.BLOCKCYPHER_API_KEY) {
        this.btcWs = new WebSocket('wss://socket.blockcypher.com/v1/btc/main');
        this.btcWs.on('open', () => {
          this.logger.log('Bitcoin WebSocket connected');
          this.btcWs?.send(JSON.stringify({ event: 'tx-confirmation' }));
        });
        this.btcWs.on('error', (error) => {
          this.logger.error('Bitcoin WebSocket error:', error);
        });
      }

      // Initialize Ethereum WebSocket only if API key is available
      if (process.env.INFURA_API_KEY) {
        this.ethWs = new WebSocket(
          `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
        );
        this.ethWs.on('open', () => {
          this.logger.log('Ethereum WebSocket connected');
        });
        this.ethWs.on('error', (error) => {
          this.logger.error('Ethereum WebSocket error:', error);
        });
      }
    } catch (error) {
      this.logger.error('Failed to initialize WebSocket connections:', error);
    }
  }

  /**
   * Encrypts sensitive data using AES-256-GCM encryption.
   * @param data - The data to encrypt
   * @returns Object containing encrypted data and initialization vector
   */
  private encryptData(data: string): { encryptedData: string; iv: string } {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    // Create cipher with AES-256-GCM algorithm
    const cipher = crypto.createCipheriv(
      this.encryptionAlgorithm,
      Buffer.from(this.encryptionKey),
      iv,
    );
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    // Return encrypted data with IV and auth tag
    return {
      encryptedData: encrypted + authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  /**
   * Decrypts data that was encrypted using encryptData.
   * @param encryptedData - The encrypted data to decrypt
   * @param iv - The initialization vector used for encryption
   * @returns The decrypted data
   */
  private decryptData(encryptedData: string, iv: string): string {
    // Create decipher with AES-256-GCM algorithm
    const decipher = crypto.createDecipheriv(
      this.encryptionAlgorithm,
      Buffer.from(this.encryptionKey),
      Buffer.from(iv, 'hex'),
    );
    // Extract and set the authentication tag
    const authTag = Buffer.from(encryptedData.slice(-32), 'hex');
    decipher.setAuthTag(authTag);
    // Decrypt the data
    let decrypted = decipher.update(encryptedData.slice(0, -32), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Creates a new cryptocurrency wallet.
   * Generates a random mnemonic and derives the wallet using BIP32.
   * Supports both Bitcoin and Ethereum wallets.
   *
   * @param name - The name for the wallet
   * @param type - The type of wallet ('BTC' or 'ETH')
   * @returns Object containing the wallet's public information
   */
  async createWallet(
    name: string,
    type: 'BTC' | 'ETH',
  ): Promise<{
    id: number;
    name: string;
    type: string;
    address: string;
  }> {
    // Generate a random mnemonic (seed phrase)
    const mnemonic = bip39.generateMnemonic();

    // Generate seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    let address: string;
    let privateKey: string;

    if (type === 'BTC') {
      // Create Bitcoin wallet using BIP32
      const network = bitcoin.networks.bitcoin;
      // Derive root key from seed
      const root = this.bip32.fromSeed(seed, network);
      // Derive child key using BIP44 path
      const path = "m/44'/0'/0'/0/0";
      const child = root.derivePath(path);

      // Generate Bitcoin address from public key
      const { address: btcAddress } = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(child.publicKey),
        network,
      });

      address = btcAddress;
      privateKey = child.toWIF();
    } else {
      // Create Ethereum wallet
      // Generate private key from seed
      const privateKeyBuffer = ethUtil.keccak256(seed.slice(0, 32));
      const privateKeyHex = privateKeyBuffer.toString('hex');
      // Derive public key from private key
      const publicKey = ethUtil.privateToPublic(privateKeyBuffer);
      // Generate Ethereum address from public key
      const addressBuffer = ethUtil.pubToAddress(publicKey);
      address = ethUtil.toChecksumAddress('0x' + addressBuffer.toString('hex'));
      privateKey = '0x' + privateKeyHex;
    }

    // Encrypt sensitive data before storage
    const encryptedPrivateKey = this.encryptData(privateKey);
    const encryptedMnemonic = this.encryptData(mnemonic);

    // Create wallet entity with encrypted data
    const wallet = this.walletRepository.create({
      name,
      type,
      address,
      encryptedPrivateKey: encryptedPrivateKey.encryptedData,
      privateKeyIv: encryptedPrivateKey.iv,
      encryptedMnemonic: encryptedMnemonic.encryptedData,
      mnemonicIv: encryptedMnemonic.iv,
    });

    // Save to database
    const savedWallet = await this.walletRepository.save(wallet);

    // Subscribe to blockchain updates for this wallet
    this.subscribeToAddressUpdates(savedWallet);

    // Return only public data
    return {
      id: savedWallet.id,
      name: savedWallet.name,
      type: savedWallet.type,
      address: savedWallet.address,
    };
  }

  /**
   * Subscribes to blockchain updates for a specific wallet address.
   * Uses WebSocket connections to receive real-time updates.
   *
   * @param wallet - The wallet to subscribe to updates for
   */
  private subscribeToAddressUpdates(wallet: Wallet) {
    try {
      if (wallet.type === 'BTC' && this.btcWs?.readyState === WebSocket.OPEN) {
        this.btcWs.send(
          JSON.stringify({
            event: 'tx-confirmation',
            address: wallet.address,
          }),
        );
      } else if (
        wallet.type === 'ETH' &&
        this.ethWs?.readyState === WebSocket.OPEN
      ) {
        this.ethWs.send(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_subscribe',
            params: ['logs', { address: wallet.address }],
          }),
        );
      }
    } catch (error) {
      this.logger.error('Failed to subscribe to address updates:', error);
    }
  }

  /**
   * Retrieves wallet information including balance and token holdings.
   *
   * @param id - The ID of the wallet to retrieve
   * @returns Object containing wallet information and balances
   */
  async getWallet(id: number): Promise<{
    id: number;
    name: string;
    type: string;
    address: string;
    balance: string;
    tokens: Array<{
      symbol: string;
      balance: string;
      price: number;
    }>;
  }> {
    // Find wallet in database
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Fetch main token balance (BTC or ETH)
    const balance = await this.fetchBalance(wallet.address, wallet.type);

    // Fetch ERC-20 token balances if it's an Ethereum wallet
    const tokens =
      wallet.type === 'ETH'
        ? await this.fetchERC20Balances(wallet.address)
        : [];

    return {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      address: wallet.address,
      balance,
      tokens,
    };
  }

  /**
   * Fetches the current balance for a wallet address.
   * Uses different APIs for Bitcoin and Ethereum.
   *
   * @param address - The wallet address to check
   * @param type - The type of wallet ('BTC' or 'ETH')
   * @returns The current balance as a string
   */
  private async fetchBalance(
    address: string,
    type: 'BTC' | 'ETH',
  ): Promise<string> {
    try {
      if (type === 'BTC') {
        // Use BlockCypher API for Bitcoin balance
        const response = await fetch(
          `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`,
        );
        const data = await response.json();
        // Convert satoshis to BTC
        return (data.balance / 100000000).toString();
      } else {
        // Use Infura API for Ethereum balance
        const response = await fetch(
          'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [address, 'latest'],
            }),
          },
        );
        const data = await response.json();
        // Convert wei to ETH
        return (parseInt(data.result, 16) / 1e18).toString();
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0.00';
    }
  }

  /**
   * Fetches ERC-20 token balances for an Ethereum wallet.
   * Currently a placeholder for future implementation.
   *
   * @param address - The Ethereum wallet address
   * @returns Array of token balances and prices
   */
  private async fetchERC20Balances(
    address: string,
  ): Promise<Array<{ symbol: string; balance: string; price: number }>> {
    // TODO: Implement ERC-20 token balance fetching
    // 1. Query the Ethereum network for ERC-20 token balances
    // 2. Fetch token prices from a price API
    return [];
  }

  /**
   * Sends a transaction from one wallet to another.
   * Validates the transaction and checks for sufficient balance.
   *
   * @param walletId - The ID of the sending wallet
   * @param amount - The amount to send
   * @param recipientAddress - The address of the recipient
   * @returns Object containing transaction details
   */
  async sendTransaction(
    walletId: number,
    amount: string,
    recipientAddress: string,
  ): Promise<{
    id: string;
    status: 'pending' | 'completed' | 'failed';
    amount: string;
    recipientAddress: string;
  }> {
    // Find the sending wallet
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Decrypt private key for transaction signing
    const privateKey = this.decryptData(
      wallet.encryptedPrivateKey,
      wallet.privateKeyIv,
    );

    // Check if wallet has sufficient balance
    const balance = await this.fetchBalance(wallet.address, wallet.type);
    if (parseFloat(balance) < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }

    // TODO: Implement actual transaction sending
    // 1. Validate recipient address
    // 2. Create and sign transaction
    // 3. Broadcast to network
    // 4. Store transaction in database

    return {
      id: 'tx_' + Date.now(),
      status: 'pending',
      amount,
      recipientAddress,
    };
  }
}
