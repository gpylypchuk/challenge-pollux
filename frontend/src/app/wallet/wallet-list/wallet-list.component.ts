import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WalletService } from '../wallet.service';
import { Wallet } from '../interfaces/wallet.interface';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './wallet-list.component.html',
  styleUrl: './wallet-list.component.scss',
})
export class WalletListComponent implements OnInit {
  wallets: Wallet[] = [];
  loading = true;
  error = '';

  constructor(
    private walletService: WalletService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(): void {
    this.loading = true;
    this.walletService.getWallets().subscribe({
      next: (wallets) => {
        this.wallets = wallets;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load wallets';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
        });
      },
    });
  }
}
