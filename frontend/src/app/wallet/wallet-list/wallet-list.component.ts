import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { WalletService } from '../wallet.service';
import { Wallet } from '../interfaces/wallet.interface';
import { WalletCreateComponent } from '../wallet-create/wallet-create.component';
import { SendTransactionComponent } from '../send-transaction/send-transaction.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterModule,
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">My Wallets</h1>
        <button
          mat-raised-button
          color="primary"
          (click)="openCreateWalletDialog()"
        >
          <mat-icon>add</mat-icon>
          New Wallet
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let wallet of wallets" class="p-4">
          <mat-card-header>
            <mat-card-title>{{ wallet.name }}</mat-card-title>
            <mat-card-subtitle>{{ wallet.type }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="mt-4">
              <p class="text-sm text-gray-500">Address</p>
              <p class="font-mono text-sm break-all">{{ wallet.address }}</p>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-500">Balance</p>
              <p class="text-xl font-bold">
                {{ wallet.balance }} {{ wallet.type }}
              </p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button
              mat-button
              color="primary"
              [routerLink]="['/wallet', wallet.id]"
            >
              View Details
            </button>
            <button mat-button color="accent" (click)="openSendDialog(wallet)">
              Send
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
})
export class WalletListComponent implements OnInit {
  wallets: Wallet[] = [];

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(): void {
    this.walletService.getWallets().subscribe({
      next: (wallets) => {
        this.wallets = wallets;
      },
      error: (error) => {
        this.snackBar.open('Error loading wallets', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  openCreateWalletDialog(): void {
    const dialogRef = this.dialog.open(WalletCreateComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadWallets();
        this.snackBar.open('Wallet created successfully', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  openSendDialog(wallet: Wallet): void {
    const dialogRef = this.dialog.open(SendTransactionComponent, {
      width: '400px',
      data: wallet,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.walletService
          .sendTransaction(wallet.id, result.amount, result.recipientAddress)
          .subscribe({
            next: (transaction) => {
              this.snackBar.open('Transaction sent successfully', 'Close', {
                duration: 3000,
              });
              this.loadWallets();
            },
            error: (error) => {
              this.snackBar.open('Error sending transaction', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }
}
