import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Wallet,
  CreateWalletDto,
  WalletTransaction,
} from './interfaces/wallet.interface';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private apiUrl = 'http://localhost:3000/api/wallets';

  constructor(private http: HttpClient) {}

  getWallets(): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(this.apiUrl);
  }

  getWallet(id: number): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/${id}`);
  }

  createWallet(wallet: CreateWalletDto): Observable<Wallet> {
    return this.http.post<Wallet>(this.apiUrl, wallet);
  }

  getWalletTransactions(walletId: number): Observable<WalletTransaction[]> {
    return this.http.get<WalletTransaction[]>(
      `${this.apiUrl}/${walletId}/transactions`
    );
  }

  sendTransaction(
    walletId: number,
    amount: string,
    address: string
  ): Observable<WalletTransaction> {
    return this.http.post<WalletTransaction>(
      `${this.apiUrl}/${walletId}/transactions`,
      {
        amount,
        address,
      }
    );
  }
}
