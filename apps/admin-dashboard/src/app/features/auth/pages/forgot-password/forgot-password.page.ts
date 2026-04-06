import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'tt-forgot-password-page',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPageComponent {
  submitted = false;
  loading   = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private readonly fb:     FormBuilder,
    private readonly notify: NotificationService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    // Demo flow: simulate sending a reset link after 1s.
    // Replace with real mutation (requestPasswordReset) when backend supports it.
    setTimeout(() => {
      this.loading   = false;
      this.submitted = true;
      this.notify.success(
        'Reset link sent',
        `A password reset link has been sent to ${this.form.value.email}.`,
      );
    }, 1000);
  }

  backToLogin(): void {
    void this.router.navigate(['/auth']);
  }
}
