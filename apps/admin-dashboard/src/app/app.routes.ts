import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './core/layout/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule,
          ),
      },
      {
        path: 'queue',
        loadChildren: () =>
          import('./features/queue/queue.module').then((m) => m.QueueModule),
        data: { roles: ['OWNER', 'BARBER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
      {
        path: 'bookings',
        loadChildren: () =>
          import('./features/bookings/bookings.module').then(
            (m) => m.BookingsModule,
          ),
        data: { roles: ['OWNER', 'BARBER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.module').then(
            (m) => m.CustomersModule,
          ),
      },
      {
        path: 'barbers',
        loadChildren: () =>
          import('./features/barbers/barbers.module').then((m) => m.BarbersModule),
        data: { roles: ['OWNER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
      {
        path: 'staff',
        loadChildren: () =>
          import('./features/staff/staff.module').then((m) => m.StaffModule),
        data: { roles: ['OWNER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./features/services/services.module').then(
            (m) => m.ServicesModule,
          ),
        data: { roles: ['OWNER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
      {
        path: 'finance',
        loadChildren: () =>
          import('./features/finance/finance.module').then(
            (m) => m.FinanceModule,
          ),
        data: { roles: ['OWNER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
      {
        path: 'marketing',
        loadChildren: () =>
          import('./features/marketing/marketing.module').then(
            (m) => m.MarketingModule,
          ),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.module').then(
            (m) => m.ReportsModule,
          ),
        data: { roles: ['OWNER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.module').then(
            (m) => m.SettingsModule,
          ),
        data: { roles: ['OWNER', 'ADMIN'] },
        canActivate: [RoleGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

