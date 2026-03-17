import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPageComponent implements OnInit {
  loading = false;
  errorMessage: string | null = null;
  role: string = 'ADMIN';

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const role = this.route.snapshot.queryParams['role'];
    this.role = role ? role.toUpperCase() : 'ADMIN';
    if (this.role === 'CUSTOMER') {
      void this.router.navigate(['/auth/customer-login']);
    }
  }

  get roleLabel(): string {
    if (this.role === 'OWNER') return 'Barber Owner';
    if (this.role === 'STAFF') return 'Staff';
    if (this.role === 'CUSTOMER') return 'Customer';
    return 'Admin';
  }

  login(): void {
    if (this.loginForm.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = null;

    const { username, password } = this.loginForm.value;
    this.auth.login(username!, password!, this.role).subscribe({
      next: () => {
        this.loading = false;
        this.notifications.success('Login successful', 'Welcome back!');
        this.redirectAfterLogin();
      },
      error: (err) => {
        this.loading = false;
        let msg = 'Login failed. Please try again.';
        if (err?.graphQLErrors?.length > 0) {
          msg = err.graphQLErrors[0].message;
        } else if (err?.networkError?.error?.errors?.length > 0) {
          msg = err.networkError.error.errors[0].message;
        } else if (err?.message) {
          msg = err.message;
        }
        this.errorMessage = msg;
        this.notifications.error('Login failed', msg);
      },
    });
  }

  private redirectAfterLogin(): void {
    const roles = this.auth.getUserRoles();
    if (roles.includes('ADMIN') || roles.includes('SHOP_OWNER')) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (roles.includes('BARBER')) {
      this.router.navigate(['/queue']);
      return;
    }
    this.router.navigate(['/dashboard']);
  }
}


