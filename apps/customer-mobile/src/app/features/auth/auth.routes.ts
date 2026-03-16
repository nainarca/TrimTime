import type { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../scanner/scanner.page').then((m) => m.ScannerPage),
  },
  {
    path: 'verify',
    loadComponent: () =>
      import('../scanner/scanner.page').then((m) => m.ScannerPage),
  },
];
