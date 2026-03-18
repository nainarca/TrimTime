import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginPageComponent } from './pages/login/login.page';
import { ForgotPasswordPageComponent } from './pages/forgot-password/forgot-password.page';
import { ResetPasswordPageComponent } from './pages/reset-password/reset-password.page';
import { CustomerLoginPageComponent } from './pages/customer-login/customer-login.page';

@NgModule({
  imports: [SharedModule, ReactiveFormsModule, AuthRoutingModule],
  declarations: [
    LoginPageComponent,
    ForgotPasswordPageComponent,
    ResetPasswordPageComponent,
    CustomerLoginPageComponent,
  ],
})
export class AuthModule {}

