import { Routes } from '@angular/router';

/**
 * TrimTime Dashboard Routes
 *
 * Route tree (to be implemented per phase):
 *
 * /auth
 *   /login              → PhoneLoginPage
 *   /verify             → OtpVerifyPage
 *
 * /onboarding           → OnboardingWizardPage (multi-step)
 *   /shop-details
 *   /add-barbers
 *   /set-hours
 *   /qr-setup
 *   /go-live
 *
 * /dashboard            → DashboardShellComponent (auth guard)
 *   /                   → LiveQueuePage  ← DEFAULT
 *   /barbers
 *   /appointments
 *   /services
 *   /qr-codes
 *   /analytics
 *   /reviews
 *   /settings
 *     /shop
 *     /hours
 *     /branches
 *     /billing
 *   /staff
 *
 * /admin                → AdminShellComponent (ADMIN role guard)
 *   /shops
 *   /users
 *   /subscriptions
 *   /analytics
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'onboarding',
    loadChildren: () =>
      import('./features/onboarding/onboarding.routes').then(
        (m) => m.ONBOARDING_ROUTES,
      ),
    // canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES,
      ),
    // canActivate: [AuthGuard, ShopGuard]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    // canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
