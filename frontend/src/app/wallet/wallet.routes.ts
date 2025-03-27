import { Routes } from '@angular/router';

export const WALLET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./wallet-list/wallet-list.component').then(
        (m) => m.WalletListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./wallet-create/wallet-create.component').then(
        (m) => m.WalletCreateComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./wallet-detail/wallet-detail.component').then(
        (m) => m.WalletDetailComponent
      ),
  },
];
