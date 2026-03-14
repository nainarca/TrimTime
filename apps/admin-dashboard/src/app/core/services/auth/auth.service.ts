import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LOGIN_MUTATION } from '../../../features/auth/graphql/auth.gql';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

const ACCESS_TOKEN_KEY = 'tt_access_token';
const REFRESH_TOKEN_KEY = 'tt_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly apollo: Apollo, private readonly router: Router) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.apollo
      .mutate<{ login: LoginResponse }>({
        mutation: LOGIN_MUTATION,
        variables: { username, password },
      })
      .pipe(
        map((result) => {
          if (!result.data?.login) {
            throw new Error('Invalid login response');
          }
          return result.data.login;
        }),
        tap((login) => {
          this.setTokens(login.accessToken, login.refreshToken);
        }),
        tap(() => {
          void this.router.navigate(['/dashboard']);
        }),
      );
  }

  logout(): void {
    this.clearTokens();
    void this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  hasAnyRole(required: string[]): boolean {
    if (!required.length) return true;
    const roles = this.getRoles();
    return required.some((r) => roles.includes(r));
  }

  private getRoles(): string[] {
    const token = this.getAccessToken();
    if (!token) return [];
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      const roles = decoded['roles'] ?? decoded['role'] ?? [];
      if (Array.isArray(roles)) {
        return roles;
      }
      if (typeof roles === 'string') {
        return [roles];
      }
      return [];
    } catch {
      return [];
    }
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

