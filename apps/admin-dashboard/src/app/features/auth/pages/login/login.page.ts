import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'tt-login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPageComponent {
  loading = false;
  errorMessage: string | null = null;
  role: string = 'OWNER';

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.role = this.route.snapshot.queryParams['role'] || 'OWNER';
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = null;

    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.loading = false;
        this.redirectBasedOnRole();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.message ?? 'Login failed. Please check your credentials and try again.';
      },
    });
  }

  private redirectBasedOnRole() {
    switch (this.role) {
      case 'OWNER':
        this.router.navigate(['/dashboard']);
        break;
      case 'STAFF':
        this.router.navigate(['/queue']);
        break;
      case 'ADMIN':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}


