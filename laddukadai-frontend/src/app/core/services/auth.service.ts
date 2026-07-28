import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.setSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem('lk_token');
    localStorage.removeItem('lk_user');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): AuthResponse | null {
    const userJson = localStorage.getItem('lk_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('lk_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isOwner(): boolean {
    return this.getRole() === 'OWNER';
  }

  isCustomer(): boolean {
    return this.getRole() === 'CUSTOMER';
  }

  isDeliveryMan(): boolean {
    return this.getRole() === 'DELIVERY_MAN';
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('lk_token', authResult.token);
    localStorage.setItem('lk_user', JSON.stringify(authResult));
  }
}
