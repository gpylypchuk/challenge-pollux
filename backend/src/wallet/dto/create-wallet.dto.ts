import { IsString, IsEnum, MinLength } from 'class-validator';
import { WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(WalletType)
  type: WalletType;
}
