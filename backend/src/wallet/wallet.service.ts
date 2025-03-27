import { Injectable } from '@nestjs/common';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ethUtil from 'ethereumjs-util';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

@Injectable()
export class WalletService {
  private bip32 = BIP32Factory(ecc);

  async createWallet(
    name: string,
    type: 'BTC' | 'ETH',
  ): Promise<{
    id: number;
    name: string;
    type: string;
    address: string;
    privateKey: string;
    mnemonic: string;
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

    // In a real application, you would:
    // 1. Encrypt the private key and mnemonic
    // 2. Store them securely in a database
    // 3. Return only the public address to the client

    return {
      id: Date.now(), // In a real app, this would come from the database
      name,
      type,
      address,
      privateKey,
      mnemonic,
    };
  }
}
