/**
 * Represents a cryptocurrency token with its balance and price information
 */
export interface Token {
  /** The token's symbol (e.g., 'USDT', 'DAI') */
  symbol: string;
  /** The token balance in its smallest unit */
  balance: string;
  /** The current price of the token in USD */
  price: number;
}

/**
 * Represents a cryptocurrency wallet
 */
export interface Wallet {
  /** Unique identifier for the wallet */
  id: number;
  /** User-defined name for the wallet */
  name: string;
  /** The type of cryptocurrency (BTC or ETH) */
  type: 'BTC' | 'ETH';
  /** The public address of the wallet */
  address: string;
  /** The current balance of the main cryptocurrency */
  balance: string;
  /** List of ERC-20 tokens held in the wallet (ETH wallets only) */
  tokens: Token[];
  /** Timestamp when the wallet was created */
  createdAt: Date;
  /** Timestamp when the wallet was last updated */
  updatedAt: Date;
}

/**
 * Data transfer object for creating a new wallet
 */
export interface CreateWalletDto {
  /** User-defined name for the wallet */
  name: string;
  /** The type of cryptocurrency (BTC or ETH) */
  type: 'BTC' | 'ETH';
}

/**
 * Represents a cryptocurrency transaction
 */
export interface WalletTransaction {
  /** Unique identifier for the transaction */
  id: string;
  /** Current status of the transaction */
  status: 'pending' | 'completed' | 'failed';
  /** Amount of cryptocurrency being transferred */
  amount: string;
  /** Address of the recipient */
  recipientAddress: string;
  /** Timestamp when the transaction was created */
  createdAt: Date;
  /** Timestamp when the transaction was last updated */
  updatedAt: Date;
}

/**
 * Data transfer object for sending a transaction
 */
export interface SendTransactionDto {
  /** Amount of cryptocurrency to send */
  amount: string;
  /** Address of the recipient */
  recipientAddress: string;
}
