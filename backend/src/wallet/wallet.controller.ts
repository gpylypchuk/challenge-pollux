import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('api/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(
    @Body() createWalletDto: { name: string; type: 'BTC' | 'ETH' },
  ) {
    return this.walletService.createWallet(
      createWalletDto.name,
      createWalletDto.type,
    );
  }
}
