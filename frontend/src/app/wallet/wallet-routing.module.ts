import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletListComponent } from './wallet-list/wallet-list.component';
import { WalletDetailComponent } from './wallet-detail/wallet-detail.component';
import { WalletCreateComponent } from './wallet-create/wallet-create.component';

const routes: Routes = [
  { path: '', component: WalletListComponent },
  { path: 'create', component: WalletCreateComponent },
  { path: ':id', component: WalletDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WalletRoutingModule {}
