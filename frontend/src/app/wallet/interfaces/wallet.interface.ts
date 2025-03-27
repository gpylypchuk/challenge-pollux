export interface Wallet {
  id: number;
  name: string;
  type: 'BTC' | 'ETH';
  address: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWalletDto {
  name: string;
  type: 'BTC' | 'ETH';
}

export interface WalletTransaction {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  recipientAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendTransactionDto {
  amount: string;
  recipientAddress: string;
}
