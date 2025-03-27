export interface Wallet {
  id: number;
  name: string;
  balance: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWalletDto {
  name: string;
  type: 'BTC' | 'ETH';
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  type: 'SEND' | 'RECEIVE';
  amount: string;
  address: string;
  timestamp: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}
