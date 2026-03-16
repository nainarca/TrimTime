import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.page';
import { LoginSelectionPageComponent } from './pages/login-selection/login-selection.page';
import { CustomerLoginPageComponent } from './pages/customer-login/customer-login.page';
import { ForgotPasswordPageComponent } from './pages/forgot-password/forgot-password.page';
import { ResetPasswordPageComponent } from './pages/reset-password/reset-password.page';

const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'login-selection',
    component: LoginSelectionPageComponent,
  },
  {
    path: 'customer-login',
    component: CustomerLoginPageComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPageComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}

