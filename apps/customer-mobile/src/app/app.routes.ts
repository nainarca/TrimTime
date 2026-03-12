import { Routes } from '@angular/router';

/**
 * TrimTime Customer App Routes
 *
 * /                     → redirect to /scan
 * /scan                 → QrScannerPage
 * /shop/:slug           → ShopLandingPage (public)
 * /join-queue           → JoinQueuePage
 * /queue/:entryId       → LiveQueueTrackerPage  ← MAIN SCREEN
 * /queue/:entryId/done  → ServedPage (review prompt)
 * /auth/login           → PhoneLoginPage
 * /auth/verify          → OtpVerifyPage
 * /profile              → CustomerProfilePage
 * /history              → VisitHistoryPage
 * /appointments         → MyAppointmentsPage
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'scan',
    pathMatch: 'full',
  },
  {
    path: 'scan',
    loadComponent: () =>
      import('./features/scanner/scanner.page').then((m) => m.ScannerPage),
  },
  {
    path: 'shop/:slug',
    loadComponent: () =>
      import('./features/shop/shop-landing.page').then(
        (m) => m.ShopLandingPage,
      ),
  },
  {
    path: 'join-queue',
    loadComponent: () =>
      import('./features/queue/join-queue.page').then((m) => m.JoinQueuePage),
  },
  {
    path: 'queue/:entryId',
    loadComponent: () =>
      import('./features/queue/live-tracker.page').then(
        (m) => m.LiveTrackerPage,
      ),
  },
  {
    path: 'queue/:entryId/done',
    loadComponent: () =>
      import('./features/queue/served.page').then((m) => m.ServedPage),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.page').then((m) => m.ProfilePage),
    // canActivate: [AuthGuard]
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/profile/history.page').then((m) => m.HistoryPage),
    // canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'scan',
  },
];
