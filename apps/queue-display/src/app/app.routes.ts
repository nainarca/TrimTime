import { Routes } from '@angular/router';

/**
 * Queue Display Kiosk Routes
 *
 * /display/:shopId             → ShopQueueDisplayPage
 * /display/:shopId/:branchId   → BranchQueueDisplayPage
 * /setup                       → KioskSetupPage (one-time config)
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'setup',
    pathMatch: 'full',
  },
  {
    path: 'display/:shopId',
    loadComponent: () =>
      import('./features/display/queue-display.page').then(
        (m) => m.QueueDisplayPage,
      ),
  },
  {
    path: 'display/:shopId/:branchId',
    loadComponent: () =>
      import('./features/display/queue-display.page').then(
        (m) => m.QueueDisplayPage,
      ),
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./features/setup/kiosk-setup.page').then(
        (m) => m.KioskSetupPage,
      ),
  },
];
