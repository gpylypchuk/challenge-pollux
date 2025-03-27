import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './wallet-list.component.html',
  styleUrl: './wallet-list.component.scss',
})
export class WalletListComponent {
  wallets = [
    { id: 1, name: 'Main Wallet', balance: '1.5 BTC' },
    { id: 2, name: 'Trading Wallet', balance: '0.8 BTC' },
    { id: 3, name: 'Savings Wallet', balance: '2.3 BTC' },
  ];
}
