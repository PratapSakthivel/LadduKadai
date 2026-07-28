import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">🟡</span>
          <h1>Welcome to Laddu Kadai</h1>
          <p>Handcrafted Organic Laddus & Pure Ghee Delicacies</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="customer@laddukadai.com" autocomplete="email" />
            <mat-icon matPrefix>email</mat-icon>
            @if (loginForm.get('email')?.hasError('required')) {
              <mat-error>Email is required</mat-error>
            }
            @if (loginForm.get('email')?.hasError('email')) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button" aria-label="Toggle password visibility">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (loginForm.get('password')?.hasError('required')) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="loginForm.invalid || isLoading">
            @if (isLoading) {
              <span>Signing in...</span>
            } @else {
              <span>Sign In</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>New to Laddu Kadai?</span>
          <a routerLink="/register">Create an account</a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 85vh;
      padding: 24px;
      background-color: #f8fafc;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 40px 32px;
      border-radius: 16px !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01) !important;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;

      .auth-logo {
        font-size: 44px;
        display: block;
        margin-bottom: 8px;
      }
      h1 {
        font-size: 24px;
        font-weight: 700;
        color: #1e1b4b;
        margin-bottom: 4px;
      }
      p {
        color: #64748b;
        font-size: 14px;
      }
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .submit-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      margin-top: 8px;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #64748b;
      display: flex;
      justify-content: center;
      gap: 6px;

      a {
        color: #4338ca;
        font-weight: 600;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  isLoading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value as any).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open(`Welcome back, ${response.name}!`, 'Close', { duration: 3000 });
        
        if (response.role === 'OWNER') {
          this.router.navigate(['/owner/dashboard']);
        } else if (response.role === 'DELIVERY_MAN') {
          this.router.navigate(['/delivery/dashboard']);
        } else {
          this.router.navigate(['/customer/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Invalid email or password';
        this.snackBar.open(msg, 'Dismiss', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
