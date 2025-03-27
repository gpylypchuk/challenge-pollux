import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './entities/wallet.entity';

@Controller('api/wallets')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(
    @Body() createWalletDto: CreateWalletDto,
  ): Promise<Wallet> {
    try {
      this.logger.log(
        `Creating wallet with data: ${JSON.stringify(createWalletDto)}`,
      );
      const wallet = await this.walletService.createWallet(createWalletDto);
      this.logger.log(`Wallet created successfully: ${JSON.stringify(wallet)}`);
      return wallet;
    } catch (error) {
      this.logger.error(
        `Failed to create wallet: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':id')
  async getWallet(@Param('id') id: string): Promise<Wallet> {
    try {
      this.logger.log(`Fetching wallet with ID: ${id}`);
      const wallet = await this.walletService.getWallet(parseInt(id, 10));
      this.logger.log(`Wallet fetched successfully: ${JSON.stringify(wallet)}`);
      return wallet;
    } catch (error) {
      this.logger.error(
        `Failed to fetch wallet: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get()
  async getWallets(): Promise<Wallet[]> {
    return this.walletService.getWallets();
  }
}
