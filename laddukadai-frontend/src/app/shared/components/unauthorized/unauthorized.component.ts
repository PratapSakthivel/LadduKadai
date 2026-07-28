import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-icon color="warn" class="warning-icon">lock</mat-icon>
        <h2>403 — Access Denied</h2>
        <p>You do not have permission to view this page. Your role (<strong>{{ authService.getRole() || 'GUEST' }}</strong>) cannot access this resource.</p>
        <button mat-raised-button color="primary" (click)="goHome()">
          Go to My Dashboard
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 24px;
    }
    .unauthorized-card {
      max-width: 480px;
      text-align: center;
      padding: 40px 24px;
      border-radius: 16px !important;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .warning-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    h2 {
      margin-bottom: 8px;
      color: #1e293b;
    }
    p {
      color: #64748b;
      margin-bottom: 24px;
    }
  `]
})
export class UnauthorizedComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  goHome(): void {
    if (this.authService.isOwner()) this.router.navigate(['/owner/dashboard']);
    else if (this.authService.isDeliveryMan()) this.router.navigate(['/delivery/dashboard']);
    else this.router.navigate(['/customer/dashboard']);
  }
}
