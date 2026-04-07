import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-customer-login-page',
  templateUrl: './customer-login.page.html',
  styleUrls: ['./customer-login.page.scss'],
})
export class CustomerLoginPageComponent {
  form = this.fb.group({
    phone: ['', Validators.required],
  });
  otpForm = this.fb.group({
    otp: ['', Validators.required],
  });
  otpSent = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notifications: NotificationService,
  ) {}

  requestOtp() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.auth.requestOtp(this.form.value.phone!).subscribe({
      next: (result) => {
        this.otpSent = true;
        this.loading = false;
        if (result?.otp) {
          this.otpForm.patchValue({ otp: result.otp });
        }
        this.notifications.success('OTP sent', 'Please check your phone.');
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err?.graphQLErrors?.[0]?.message || err?.message || 'Failed to send OTP';
        this.notifications.error('OTP Error', msg);
      },
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid || this.loading) return;
    this.loading = true;
    this.auth.verifyOtp(this.form.value.phone!, this.otpForm.value.otp!).subscribe({
      next: () => {
        this.loading = false;
        this.notifications.success('Login successful', 'Welcome!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.graphQLErrors?.[0]?.message || err?.message || 'Invalid OTP';
        this.notifications.error('OTP Error', msg);
      },
    });
  }
}