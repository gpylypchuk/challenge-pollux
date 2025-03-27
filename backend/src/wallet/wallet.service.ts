import { Injectable, Logger } from '@nestjs/common';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ethUtil from 'ethereumjs-util';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletType } from './entities/wallet.entity';
import * as crypto from 'crypto';
import { WebSocket } from 'ws';
import { ConfigService } from '@nestjs/config';
import { CreateWalletDto } from './dto/create-wallet.dto';

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
  // WebSocket connections for real-time blockchain updates
  private btcWs: WebSocket | null = null;
  private ethWs: WebSocket | null = null;
  private readonly useTestNetworks = process.env.USE_TEST_NETWORKS === 'true';

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private configService: ConfigService,
  ) {
    this.initializeWebSockets();
  }

  /**
   * Initializes WebSocket connections for real-time blockchain updates.
   * Connects to BlockCypher for Bitcoin and Infura for Ethereum.
   */
  private initializeWebSockets() {
    try {
      // Initialize Bitcoin WebSocket
      if (this.useTestNetworks) {
        if (process.env.BLOCKCYPHER_TESTNET_API_KEY) {
          this.btcWs = new WebSocket(
            'wss://socket.blockcypher.com/v1/btc/test3',
          );
          this.btcWs.on('open', () => {
            this.logger.log('Bitcoin Testnet WebSocket connected');
            this.btcWs?.send(JSON.stringify({ event: 'tx-confirmation' }));
          });
          this.btcWs.on('error', (error) => {
            this.logger.error('Bitcoin Testnet WebSocket error:', error);
          });
        }
      } else {
        if (process.env.BLOCKCYPHER_API_KEY) {
          this.btcWs = new WebSocket(
            'wss://socket.blockcypher.com/v1/btc/main',
          );
          this.btcWs.on('open', () => {
            this.logger.log('Bitcoin Mainnet WebSocket connected');
            this.btcWs?.send(JSON.stringify({ event: 'tx-confirmation' }));
          });
          this.btcWs.on('error', (error) => {
            this.logger.error('Bitcoin Mainnet WebSocket error:', error);
          });
        }
      }

      // Initialize Ethereum WebSocket
      if (this.useTestNetworks) {
        if (process.env.INFURA_SEPOLIA_API_KEY) {
          this.ethWs = new WebSocket(
            `wss://sepolia.infura.io/ws/v3/${process.env.INFURA_SEPOLIA_API_KEY}`,
          );
          this.ethWs.on('open', () => {
            this.logger.log('Ethereum Sepolia Testnet WebSocket connected');
          });
          this.ethWs.on('error', (error) => {
            this.logger.error(
              'Ethereum Sepolia Testnet WebSocket error:',
              error,
            );
          });
        }
      } else {
        if (process.env.INFURA_API_KEY) {
          this.ethWs = new WebSocket(
            `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
          );
          this.ethWs.on('open', () => {
            this.logger.log('Ethereum Mainnet WebSocket connected');
          });
          this.ethWs.on('error', (error) => {
            this.logger.error('Ethereum Mainnet WebSocket error:', error);
          });
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize WebSocket connections:', error);
    }
  }

  /**
   * Encrypts sensitive data using AES-256-GCM encryption.
   * @param data - The data to encrypt
   * @returns Encrypted data in the format: iv:encryptedData:authTag
   */
  private encryptData(data: string): string {
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(
      this.configService.get<string>('ENCRYPTION_KEY'),
      'hex',
    );
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  /**
   * Decrypts data that was encrypted using encryptData.
   * @param encryptedData - The encrypted data to decrypt
   * @returns The decrypted data
   */
  private decryptData(encryptedData: string): string {
    const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = Buffer.from(
      this.configService.get<string>('ENCRYPTION_KEY'),
      'hex',
    );
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Creates a new wallet with the specified type and name.
   * Generates necessary keys and addresses based on wallet type.
   */
  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      // Generate mnemonic and derive keys
      const mnemonic = bip39.generateMnemonic();
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const root = this.bip32.fromSeed(seed);

      let address: string;
      let privateKey: string;

      // Generate address and private key based on wallet type
      if (createWalletDto.type === WalletType.BTC) {
        const child = root.derivePath("m/84'/0'/0'/0/0");
        const { address: btcAddress } = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(child.publicKey),
        });
        address = btcAddress!;
        privateKey = child.privateKey!.toString();
      } else {
        // ETH wallet generation logic here
        const child = root.derivePath("m/44'/60'/0'/0/0");
        const pubKeyBuffer = Buffer.from(child.publicKey);
        address = '0x' + pubKeyBuffer.toString('hex');
        privateKey = Buffer.from(child.privateKey!).toString('hex');
      }

      // Encrypt sensitive data
      const encryptedPrivateKey = this.encryptData(privateKey);
      const encryptedMnemonic = this.encryptData(mnemonic);

      // Create and save wallet
      const wallet = this.walletRepository.create({
        name: createWalletDto.name,
        type: createWalletDto.type,
        address,
        encryptedPrivateKey,
        encryptedMnemonic,
        tokens: [],
      });

      const savedWallet = await this.walletRepository.save(wallet);

      // Subscribe to address updates
      this.subscribeToAddressUpdates(savedWallet);

      return savedWallet;
    } catch (error) {
      this.logger.error(
        `Failed to create wallet: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
   * Retrieves all wallets from the database.
   * @returns Array of all wallets
   */
  async getWallets(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  /**
   * Retrieves wallet information including balance and token holdings.
   *
   * @param id - The ID of the wallet to retrieve
   * @returns The wallet entity with updated balances
   */
  async getWallet(id: number): Promise<Wallet> {
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

    // Update wallet with current balances
    wallet.tokens = tokens;
    return wallet;
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
        const network = this.useTestNetworks ? 'test3' : 'main';
        const apiKey = this.useTestNetworks
          ? process.env.BLOCKCYPHER_TESTNET_API_KEY
          : process.env.BLOCKCYPHER_API_KEY;

        const response = await fetch(
          `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}/balance${
            apiKey ? `?token=${apiKey}` : ''
          }`,
        );
        const data = await response.json();
        return (data.balance / 100000000).toString();
      } else {
        const network = this.useTestNetworks ? 'sepolia' : 'mainnet';
        const apiKey = this.useTestNetworks
          ? process.env.INFURA_SEPOLIA_API_KEY
          : process.env.INFURA_API_KEY;

        const response = await fetch(
          `https://${network}.infura.io/v3/${apiKey}`,
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
        return (parseInt(data.result, 16) / 1e18).toString();
      }
    } catch (error) {
      this.logger.error('Error fetching balance:', error);
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
    const privateKey = this.decryptData(wallet.encryptedPrivateKey);

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
