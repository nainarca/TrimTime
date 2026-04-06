import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-reset-password-page',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPageComponent {
  token     = this.route.snapshot.queryParamMap.get('token') ?? 'demo-token';
  completed = false;
  loading   = false;
  mismatch  = false;

  form = this.fb.group({
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor(
    private readonly fb:     FormBuilder,
    private readonly route:  ActivatedRoute,
    private readonly router: Router,
    private readonly notify: NotificationService,
  ) {}

  submit(): void {
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.mismatch = true;
      return;
    }
    this.mismatch = false;
    this.loading  = true;

    // Demo flow: simulate password reset after 1s.
    // Replace with real mutation (resetPassword) when backend supports it.
    setTimeout(() => {
      this.loading   = false;
      this.completed = true;
      this.notify.success('Password reset', 'Your password has been updated. You can now log in.');
    }, 1000);
  }

  goToLogin(): void {
    void this.router.navigate(['/auth']);
  }
}
