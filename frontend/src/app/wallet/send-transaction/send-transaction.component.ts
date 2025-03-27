import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Wallet } from '../interfaces/wallet.interface';

@Component({
  selector: 'app-send-transaction',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Send {{ data.type }}</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Recipient Address</mat-label>
          <input
            matInput
            formControlName="recipientAddress"
            [placeholder]="'Enter ' + data.type + ' address'"
          />
          <mat-error *ngIf="form.get('recipientAddress')?.hasError('required')">
            Recipient address is required
          </mat-error>
          <mat-error *ngIf="form.get('recipientAddress')?.hasError('pattern')">
            Invalid {{ data.type }} address
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-full mt-4">
          <mat-label>Amount</mat-label>
          <input
            matInput
            formControlName="amount"
            type="number"
            step="0.00000001"
            placeholder="Enter amount"
          />
          <mat-error *ngIf="form.get('amount')?.hasError('required')">
            Amount is required
          </mat-error>
          <mat-error *ngIf="form.get('amount')?.hasError('min')">
            Amount must be greater than 0
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="!form.valid"
        >
          Send
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class SendTransactionComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SendTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Wallet
  ) {
    this.form = this.fb.group({
      recipientAddress: [
        '',
        [
          Validators.required,
          Validators.pattern(
            data.type === 'BTC'
              ? /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
              : /^0x[a-fA-F0-9]{40}$/
          ),
        ],
      ],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
