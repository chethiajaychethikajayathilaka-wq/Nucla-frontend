import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Redirect to landing page if not authenticated
    this.router.navigate(['/']);
    return false;
  }
}

export const authGuard: CanActivateFn = () => {
  const guard = inject(AuthGuard);
  return guard.canActivate();
};
