import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WalletType {
  BTC = 'BTC',
  ETH = 'ETH',
}

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: WalletType,
  })
  type: WalletType;

  @Column()
  address: string;

  @Column()
  encryptedPrivateKey: string;

  @Column({ nullable: true })
  encryptedMnemonic: string;

  @Column('jsonb', { nullable: true })
  tokens: Array<{
    symbol: string;
    balance: string;
    price: number;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
