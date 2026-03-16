import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';

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
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  requestOtp() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.requestOtp(this.form.value.phone!).subscribe({
      next: () => {
        this.otpSent = true;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Failed to send OTP';
      },
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.verifyOtp(this.form.value.phone!, this.otpForm.value.otp!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Invalid OTP';
      },
    });
  }
}