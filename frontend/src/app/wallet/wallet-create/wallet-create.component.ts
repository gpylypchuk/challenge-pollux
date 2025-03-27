import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { WalletService } from '../wallet.service';
import { CreateWalletDto } from '../interfaces/wallet.interface';

@Component({
  selector: 'app-wallet-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './wallet-create.component.html',
  styleUrl: './wallet-create.component.scss',
})
export class WalletCreateComponent {
  walletForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.walletForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['BTC', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.walletForm.valid) {
      this.loading = true;
      const walletData: CreateWalletDto = this.walletForm.value;

      this.walletService.createWallet(walletData).subscribe({
        next: (wallet) => {
          this.snackBar.open('Wallet created successfully!', 'Close', {
            duration: 5000,
          });
          this.router.navigate(['/wallets']);
        },
        error: (error) => {
          this.error = 'Failed to create wallet';
          this.snackBar.open(this.error, 'Close', {
            duration: 5000,
          });
          this.loading = false;
        },
      });
    }
  }
}
