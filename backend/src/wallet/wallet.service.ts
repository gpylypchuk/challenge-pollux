import { Injectable } from '@nestjs/common';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ethUtil from 'ethereumjs-util';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  private bip32 = BIP32Factory(ecc);
  private readonly encryptionKey =
    process.env.ENCRYPTION_KEY || 'your-secure-encryption-key';
  private readonly encryptionAlgorithm = 'aes-256-gcm';

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  private encryptData(data: string): { encryptedData: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.encryptionAlgorithm,
      Buffer.from(this.encryptionKey),
      iv,
    );
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      encryptedData: encrypted + authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  private decryptData(encryptedData: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      this.encryptionAlgorithm,
      Buffer.from(this.encryptionKey),
      Buffer.from(iv, 'hex'),
    );
    const authTag = Buffer.from(encryptedData.slice(-32), 'hex');
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData.slice(0, -32), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async createWallet(
    name: string,
    type: 'BTC' | 'ETH',
  ): Promise<{
    id: number;
    name: string;
    type: string;
    address: string;
  }> {
    // Generate a random mnemonic
    const mnemonic = bip39.generateMnemonic();

    // Generate seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    let address: string;
    let privateKey: string;

    if (type === 'BTC') {
      // Create Bitcoin wallet
      const network = bitcoin.networks.bitcoin;
      const root = this.bip32.fromSeed(seed, network);
      const path = "m/44'/0'/0'/0/0";
      const child = root.derivePath(path);

      const { address: btcAddress } = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(child.publicKey),
        network,
      });

      address = btcAddress;
      privateKey = child.toWIF();
    } else {
      // Create Ethereum wallet
      const privateKeyBuffer = ethUtil.keccak256(seed.slice(0, 32));
      const privateKeyHex = privateKeyBuffer.toString('hex');
      const publicKey = ethUtil.privateToPublic(privateKeyBuffer);
      const addressBuffer = ethUtil.pubToAddress(publicKey);
      address = ethUtil.toChecksumAddress('0x' + addressBuffer.toString('hex'));
      privateKey = '0x' + privateKeyHex;
    }

    // Encrypt sensitive data
    const encryptedPrivateKey = this.encryptData(privateKey);
    const encryptedMnemonic = this.encryptData(mnemonic);

    // Create wallet entity
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

    // Return only public data
    return {
      id: savedWallet.id,
      name: savedWallet.name,
      type: savedWallet.type,
      address: savedWallet.address,
    };
  }

  async getWallet(id: number): Promise<{
    id: number;
    name: string;
    type: string;
    address: string;
    balance: string;
  }> {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // In a real application, you would fetch the balance from the blockchain
    const balance = await this.fetchBalance(wallet.address, wallet.type);

    return {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      address: wallet.address,
      balance,
    };
  }

  private async fetchBalance(
    address: string,
    type: 'BTC' | 'ETH',
  ): Promise<string> {
    // This is a placeholder. In a real application, you would:
    // 1. For BTC: Use a Bitcoin API (e.g., BlockCypher, Blockchain.info)
    // 2. For ETH: Use an Ethereum API (e.g., Infura, Alchemy)
    return '0.00';
  }

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
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Decrypt private key
    const privateKey = this.decryptData(
      wallet.encryptedPrivateKey,
      wallet.privateKeyIv,
    );

    // In a real application, you would:
    // 1. Validate the recipient address
    // 2. Check if the wallet has sufficient balance
    // 3. Create and sign the transaction
    // 4. Broadcast the transaction to the network
    // 5. Store the transaction in your database

    return {
      id: 'tx_' + Date.now(),
      status: 'pending',
      amount,
      recipientAddress,
    };
  }
}
