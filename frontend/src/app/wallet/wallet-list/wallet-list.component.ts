import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WalletService } from '../wallet.service';
import { Wallet } from '../interfaces/wallet.interface';
import { WalletCreateComponent } from '../wallet-create/wallet-create.component';
import { SendTransactionComponent } from '../send-transaction/send-transaction.component';

/**
 * Component responsible for displaying the list of wallets and managing wallet operations.
 * Features:
 * - View wallet details
 * - Create new wallets
 * - Send transactions
 * - Refresh wallet balances
 */
@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './wallet-list.component.html',
})
export class WalletListComponent implements OnInit {
  wallets: Wallet[] = [];
  refreshing = false;

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  /**
   * Formats a price number to 2 decimal places
   * @param price The price to format
   * @returns Formatted price string
   */
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  /**
   * Loads all wallets for the current user
   */
  loadWallets(): void {
    this.walletService.getWallets().subscribe({
      next: (wallets) => {
        this.wallets = wallets;
      },
      error: (error) => {
        this.snackBar.open('Failed to load wallets', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  /**
   * Refreshes the balance of all wallets
   */
  refreshBalances(): void {
    this.refreshing = true;
    this.walletService.getWallets().subscribe({
      next: (wallets) => {
        this.wallets = wallets;
        this.refreshing = false;
        this.snackBar.open('Balances updated', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.refreshing = false;
        this.snackBar.open('Failed to refresh balances', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  /**
   * Opens the dialog to create a new wallet
   */
  openCreateWalletDialog(): void {
    const dialogRef = this.dialog.open(WalletCreateComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadWallets();
        this.snackBar.open('Wallet created successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  /**
   * Opens the dialog to send cryptocurrency
   * @param wallet The wallet to send from
   */
  openSendDialog(wallet: Wallet): void {
    const dialogRef = this.dialog.open(SendTransactionComponent, {
      width: '400px',
      data: { wallet },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadWallets();
        this.snackBar.open('Transaction sent successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }
}
