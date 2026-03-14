import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly notifications: NotificationService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const requiredRoles = (route.data['roles'] as string[]) ?? [];
    if (!requiredRoles.length) {
      return true;
    }

    if (this.auth.hasAnyRole(requiredRoles)) {
      return true;
    }

    this.notifications.warn('Access denied', 'You do not have permission to view this page.');
    return this.router.createUrlTree(['/dashboard']);
  }
}

