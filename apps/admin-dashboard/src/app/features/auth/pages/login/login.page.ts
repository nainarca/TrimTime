import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { environment } from '../../../../../environments/environment';

interface RoleTab { key: string; label: string; }

@Component({
  selector: 'tt-login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPageComponent implements OnInit {
  loading = false;
  otpLoading = false;
  errorMessage: string | null = null;
  otpMessage: string | null = null;
  otpSent = false;

  roleTabs: RoleTab[] = [
    { key: 'CUSTOMER', label: 'Customer' },
    { key: 'OWNER', label: 'Owner' },
    { key: 'STAFF', label: 'Staff' },
    { key: 'ADMIN', label: 'Admin' },
  ];

  selectedRole: string = 'ADMIN';

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s()+-]{6,20}$/)]],
    otp: ['', []],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    const role = this.route.snapshot.queryParams['role'];
    this.selectedRole = this.roleTabs.some((tab) => tab.key === (role || '').toString().toUpperCase())
      ? (role || '').toString().toUpperCase()
      : 'ADMIN';
    this.applyRoleFields();
    this.applyDevLoginDefaults();
  }

  private applyDevLoginDefaults(): void {
    if (environment.production) return;
    if (!('devLoginDefaults' in environment) || !environment.devLoginDefaults) return;
    const defs = environment.devLoginDefaults;
    const row = defs[this.selectedRole as keyof typeof defs];
    if (!row) return;
    if (this.isCustomer) {
      const patch: { phone?: string; otp?: string } = {};
      if ('phone' in row && row.phone) patch.phone = row.phone;
      if ('otp' in row && row.otp) patch.otp = row.otp;
      if (Object.keys(patch).length) this.loginForm.patchValue(patch);
    } else if (!this.isCustomer && 'username' in row && 'password' in row && row.username && row.password) {
      this.loginForm.patchValue({ username: row.username, password: row.password });
    }
  }

  get isCustomer(): boolean {
    return this.selectedRole === 'CUSTOMER';
  }

  get roleTitle(): string {
    if (this.selectedRole === 'OWNER') return 'Barber Owner';
    if (this.selectedRole === 'STAFF') return 'Staff';
    if (this.selectedRole === 'CUSTOMER') return 'Customer';
    return 'Admin';
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.errorMessage = null;
    this.otpMessage = null;
    this.otpSent = false;
    this.applyRoleFields();
    this.applyDevLoginDefaults();
  }

  private applyRoleFields(): void {
    if (this.isCustomer) {
      this.loginForm.get('phone')?.setValidators([Validators.required, Validators.pattern(/^[\d\s()+-]{6,20}$/)]);
      this.loginForm.get('otp')?.setValidators([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(12),
      ]);
      this.loginForm.get('username')?.clearValidators();
      this.loginForm.get('password')?.clearValidators();
    } else {
      this.loginForm.get('username')?.setValidators([Validators.required]);
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
      this.loginForm.get('phone')?.clearValidators();
      this.loginForm.get('otp')?.clearValidators();
    }
    this.loginForm.get('username')?.updateValueAndValidity();
    this.loginForm.get('password')?.updateValueAndValidity();
    this.loginForm.get('phone')?.updateValueAndValidity();
    this.loginForm.get('otp')?.updateValueAndValidity();
  }

  sendOtp(): void {
    if (!this.loginForm.get('phone')?.valid || this.otpLoading) return;
    this.otpLoading = true;
    this.errorMessage = null;
    this.otpMessage = null;
    const phone = this.loginForm.value.phone || '';

    this.auth.requestOtp(phone).subscribe({
      next: (result) => {
        this.otpLoading = false;
        this.otpSent = true;
        this.otpMessage = result?.message || 'OTP sent successfully';
        // Always use the code the API just issued (random OTP if DEV_STATIC_OTP= is empty; avoids stale 123456 in the field).
        if (result?.otp) {
          this.loginForm.patchValue({ otp: result.otp });
        }
        this.notifications.success('OTP sent', this.otpMessage || 'OTP sent successfully');
      },
      error: (err) => {
        this.otpLoading = false;
        this.errorMessage = this.extractFriendlyError(err, 'Could not send OTP. Please try again.');
      },
    });
  }

  verifyOtp(): void {
    if (!this.loginForm.get('phone')?.valid || !this.loginForm.get('otp')?.valid || this.loading) return;
    this.loading = true;
    this.errorMessage = null;
    const phone = this.loginForm.value.phone || '';
    const otp = this.loginForm.value.otp || '';

    this.auth.verifyOtp(phone, otp).subscribe({
      next: () => {
        this.loading = false;
        this.notifications.success('Login successful', 'OTP verified');
        this.navigateToDashboard();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.extractFriendlyError(err, 'OTP verification failed.');
      },
    });
  }

  login(): void {
    if (this.isCustomer) {
      this.errorMessage = 'Use OTP flow for customer login.';
      return;
    }
    if (this.loginForm.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = null;

    const username = this.loginForm.value.username || '';
    const password = this.loginForm.value.password || '';
    this.auth.login(username, password, this.selectedRole).subscribe({
      next: () => {
        this.loading = false;
        this.notifications.success('Login successful', 'Welcome back!');
        this.navigateToDashboard();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.extractFriendlyError(err, 'Login failed. Please try again.');
      },
    });
  }

  private navigateToDashboard(): void {
    const returnUrl = this.route.snapshot.queryParams['redirect'] || '/dashboard';
    this.ngZone.run(() => {
      this.router.navigateByUrl(returnUrl);
    });
  }

  private extractFriendlyError(err: any, fallback: string): string {
    if (err?.graphQLErrors?.length > 0) {
      return err.graphQLErrors[0]?.message || fallback;
    }
    if (err?.networkError?.error?.errors?.length > 0) {
      return err.networkError.error.errors[0]?.message || fallback;
    }
    if (err?.message) {
      return err.message;
    }
    return fallback;
  }
}


