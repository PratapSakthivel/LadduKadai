import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">🟡</span>
          <h1>Join Laddu Kadai</h1>
          <p>Create your account to order fresh organic laddus</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" placeholder="John Doe" autocomplete="name" />
            <mat-icon matPrefix>person</mat-icon>
            @if (registerForm.get('name')?.hasError('required')) {
              <mat-error>Full name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="john@example.com" autocomplete="email" />
            <mat-icon matPrefix>email</mat-icon>
            @if (registerForm.get('email')?.hasError('required')) {
              <mat-error>Email is required</mat-error>
            }
            @if (registerForm.get('email')?.hasError('email')) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" placeholder="9123456789" autocomplete="tel" />
            <mat-icon matPrefix>phone</mat-icon>
            @if (registerForm.get('phone')?.hasError('required')) {
              <mat-error>Phone number is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="new-password" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button" aria-label="Toggle password visibility">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (registerForm.get('password')?.hasError('required')) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Referral Code (Optional)</mat-label>
            <input matInput formControlName="referredByCode" placeholder="HST4EEV7" style="text-transform: uppercase;" />
            <mat-icon matPrefix>card_giftcard</mat-icon>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="registerForm.invalid || isLoading">
            @if (isLoading) {
              <span>Creating Account...</span>
            } @else {
              <span>Register</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/login">Sign in here</a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      padding: 24px;
      background-color: #f8fafc;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 40px 32px;
      border-radius: 16px !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 28px;

      .auth-logo {
        font-size: 40px;
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
      gap: 12px;
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
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  isLoading = false;

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['CUSTOMER'],
    referredByCode: ['']
  });

  ngOnInit(): void {
    // Read ?ref=CODE from URL if present
    this.route.queryParams.subscribe(params => {
      if (params['ref']) {
        this.registerForm.patchValue({ referredByCode: params['ref'] });
        this.snackBar.open(`Referral code ${params['ref']} applied!`, 'Awesome', { duration: 4000 });
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.authService.register(this.registerForm.value as any).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open(`Account created! Welcome, ${response.name}!`, 'Close', { duration: 3000 });
        this.router.navigate(['/customer/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(msg, 'Dismiss', { duration: 4000 });
      }
    });
  }
}
