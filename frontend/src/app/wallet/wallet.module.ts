import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { WalletRoutingModule } from './wallet-routing.module';
import { WalletListComponent } from './wallet-list/wallet-list.component';
import { WalletDetailComponent } from './wallet-detail/wallet-detail.component';
import { WalletCreateComponent } from './wallet-create/wallet-create.component';
import { WalletService } from './wallet.service';

@NgModule({
  declarations: [
    WalletListComponent,
    WalletDetailComponent,
    WalletCreateComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    WalletRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [WalletService],
})
export class WalletModule {}
