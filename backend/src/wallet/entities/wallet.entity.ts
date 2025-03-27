import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: 'BTC' | 'ETH';

  @Column()
  address: string;

  @Column()
  encryptedPrivateKey: string;

  @Column()
  privateKeyIv: string;

  @Column()
  encryptedMnemonic: string;

  @Column()
  mnemonicIv: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
