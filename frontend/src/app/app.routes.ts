import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'wallets',
        pathMatch: 'full',
      },
      {
        path: 'wallets',
        loadChildren: () =>
          import('./wallet/wallet.routes').then((m) => m.WALLET_ROUTES),
      },
    ],
  },
];
