import { Routes } from '@angular/router';

/**
 * QueueCut Customer App Routes
 *
 * /tabs/scan          → ScannerPage         (Tab 1 — home)
 * /tabs/profile       → ProfilePage         (Tab 2)
 * /shop/:slug         → ShopLandingPage     (push, outside tabs)
 * /join-queue         → JoinQueuePage       (push, outside tabs)
 * /queue/:entryId     → LiveTrackerPage     (push, MAIN SCREEN)
 * /queue/:entryId/done → ServedPage         (push)
 * /history            → HistoryPage         (push)
 * /auth/...           → auth stubs
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/scan',
    pathMatch: 'full',
  },
  {
    path: 'scan',
    redirectTo: 'tabs/scan',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'scan',
        loadComponent: () =>
          import('./features/scanner/scanner.page').then((m) => m.ScannerPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'scan',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'shop/:slug',
    loadComponent: () =>
      import('./features/shop/shop-landing.page').then((m) => m.ShopLandingPage),
  },
  {
    path: 'join-queue',
    loadComponent: () =>
      import('./features/queue/join-queue.page').then((m) => m.JoinQueuePage),
  },
  {
    path: 'queue/:entryId',
    loadComponent: () =>
      import('./features/queue/live-tracker.page').then((m) => m.LiveTrackerPage),
  },
  {
    path: 'queue/:entryId/done',
    loadComponent: () =>
      import('./features/queue/served.page').then((m) => m.ServedPage),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/profile/history.page').then((m) => m.HistoryPage),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'tabs/scan',
  },
];
