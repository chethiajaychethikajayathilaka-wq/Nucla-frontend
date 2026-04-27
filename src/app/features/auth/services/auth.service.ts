import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresIn: number;
}

export interface RegisterPayload {
  username: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ForgotPasswordPayload {
  username: string;
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface PasswordResetPayload {
  username: string;
  email: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface ResetPasswordWithTokenPayload {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';

  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  forgotPassword(data: ForgotPasswordPayload): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/reset-request`, data);
  }

  changePassword(data: ChangePasswordPayload): Observable<ChangePasswordResponse> {
    return this.http.put<ChangePasswordResponse>(`${this.apiUrl}/password`, data);
  }

  /**
   * Request password reset - generates reset token and sends email
   */
  requestPasswordReset(data: PasswordResetPayload): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/reset-request`, data);
  }

  /**
   * Reset password using token
   */
  resetPassword(token: string, data: ResetPasswordWithTokenPayload): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/reset/${token}`, data);
  }

  // Token Management
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
