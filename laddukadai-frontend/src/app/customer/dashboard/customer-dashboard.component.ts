import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ReferralService } from '../../core/services/referral.service';
import { ReferralStats } from '../../core/models/referral.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="dashboard-banner">
        <div class="banner-text">
          <h1>Hello, {{ authService.getCurrentUser()?.name }}! 👋</h1>
          <p>Welcome back to Laddu Kadai. Enjoy our freshly rolled organic laddus made with pure ghee.</p>
        </div>
        <div class="banner-actions">
          <button mat-raised-button color="primary" routerLink="/customer/catalog">
            <mat-icon>shopping_bag</mat-icon> Browse Sweets
          </button>
        </div>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading) {
        <!-- Summary Cards Grid -->
        <div class="stats-grid">
          <mat-card class="stat-card border-indigo">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="icon-indigo">shopping_cart</mat-icon>
                <span class="stat-title">My Orders</span>
              </div>
              <div class="stat-value">{{ totalOrders }}</div>
              <div class="stat-subtext">Total orders placed</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card border-emerald">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="icon-emerald">autorenew</mat-icon>
                <span class="stat-title">Active Subscriptions</span>
              </div>
              <div class="stat-value">{{ activeSubscriptions }}</div>
              <div class="stat-subtext">Recurring deliveries</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card border-amber">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="icon-amber">card_giftcard</mat-icon>
                <span class="stat-title">Free Rewards</span>
              </div>
              <div class="stat-value">{{ pendingRewardsCount }}</div>
              <div class="stat-subtext">250g Free Laddu rewards</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card border-purple">
            <mat-card-content>
              <div class="stat-header">
                <mat-icon class="icon-purple">people</mat-icon>
                <span class="stat-title">Confirmed Referrals</span>
              </div>
              <div class="stat-value">{{ referralStats?.confirmedReferrals || 0 }}/5</div>
              <div class="stat-subtext">Progress to next 250g reward</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Referral Link Callout -->
        <mat-card class="referral-banner-card">
          <mat-card-content class="referral-banner-content">
            <div class="referral-info">
              <span class="gift-badge">🎁 Referral Program</span>
              <h2>Earn 250g Free Laddus!</h2>
              <p>Share your referral link with friends. Every 5 friends who complete an order earns you 250g free laddus!</p>
              <div class="link-copy-box">
                <input type="text" [value]="referralStats?.referralLink || ''" readonly #refInput />
                <button mat-raised-button color="accent" (click)="copyLink(refInput.value)">
                  <mat-icon>content_copy</mat-icon> Copy Link
                </button>
              </div>
            </div>
            <div class="referral-progress">
              <span class="progress-label">Milestone Progress ({{ referralStats?.confirmedReferrals || 0 }}/5)</span>
              <mat-progress-bar mode="determinate" [value]="((referralStats?.confirmedReferrals || 0) / 5) * 100"></mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Navigation -->
        <div class="quick-actions-section">
          <h3>Quick Actions</h3>
          <div class="actions-grid">
            <mat-card class="action-card" routerLink="/customer/catalog">
              <mat-icon color="primary">storefront</mat-icon>
              <h4>Order Sweets</h4>
              <p>Browse available products and order instantly</p>
            </mat-card>

            <mat-card class="action-card" routerLink="/customer/my-subscriptions">
              <mat-icon color="accent">event_repeat</mat-icon>
              <h4>Manage Subscriptions</h4>
              <p>Set up or pause your recurring delivery frequency</p>
            </mat-card>

            <mat-card class="action-card" routerLink="/customer/my-orders">
              <mat-icon color="primary">receipt_long</mat-icon>
              <h4>Order History</h4>
              <p>Track delivery status and view past purchases</p>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .dashboard-banner {
      background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
      color: #ffffff;
      padding: 36px 32px;
      border-radius: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      box-shadow: 0 10px 25px -5px rgba(49, 46, 129, 0.3);

      h1 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      p {
        font-size: 15px;
        color: #c7d2fe;
        max-width: 600px;
      }
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      border-radius: 16px !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
      border-left: 4px solid transparent;

      .stat-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .stat-title {
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
      }
      .stat-value {
        font-size: 32px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 4px;
      }
      .stat-subtext {
        font-size: 12px;
        color: #94a3b8;
      }
    }
    .border-indigo { border-left-color: #4338ca; }
    .border-emerald { border-left-color: #10b981; }
    .border-amber { border-left-color: #f59e0b; }
    .border-purple { border-left-color: #8b5cf6; }

    .icon-indigo { color: #4338ca; }
    .icon-emerald { color: #10b981; }
    .icon-amber { color: #f59e0b; }
    .icon-purple { color: #8b5cf6; }

    .referral-banner-card {
      border-radius: 20px !important;
      background: #f0fdf4 !important;
      border: 1px solid #bbf7d0;
      margin-bottom: 32px;
      padding: 12px;
    }
    .referral-banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .referral-info {
      flex: 1;
      min-width: 300px;

      .gift-badge {
        font-size: 12px;
        font-weight: 700;
        color: #15803d;
        background: #dcfce7;
        padding: 4px 10px;
        border-radius: 12px;
        display: inline-block;
        margin-bottom: 8px;
      }
      h2 {
        font-size: 22px;
        font-weight: 700;
        color: #14532d;
        margin-bottom: 6px;
      }
      p {
        font-size: 14px;
        color: #166534;
        margin-bottom: 16px;
      }
    }
    .link-copy-box {
      display: flex;
      gap: 8px;
      max-width: 500px;

      input {
        flex: 1;
        padding: 10px 16px;
        border-radius: 8px;
        border: 1px solid #86efac;
        background: #ffffff;
        font-family: monospace;
        font-size: 14px;
        color: #14532d;
      }
    }
    .referral-progress {
      width: 280px;

      .progress-label {
        font-size: 13px;
        font-weight: 600;
        color: #15803d;
        margin-bottom: 8px;
        display: block;
      }
    }
    .quick-actions-section {
      h3 {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 16px;
      }
    }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }
    .action-card {
      padding: 24px;
      border-radius: 16px !important;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08) !important;
      }
      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        margin-bottom: 12px;
      }
      h4 {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 4px;
      }
      p {
        font-size: 13px;
        color: #64748b;
      }
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private subscriptionService = inject(SubscriptionService);
  private referralService = inject(ReferralService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  totalOrders = 0;
  activeSubscriptions = 0;
  pendingRewardsCount = 0;
  referralStats: ReferralStats | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.totalOrders = orders.length;
      }
    });

    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subs) => {
        this.activeSubscriptions = subs.filter(s => s.status === 'ACTIVE').length;
      }
    });

    this.referralService.getMyStats().subscribe({
      next: (stats) => {
        this.referralStats = stats;
        this.pendingRewardsCount = stats.pendingRewards?.length || 0;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  copyLink(link: string): void {
    navigator.clipboard.writeText(link);
    this.snackBar.open('Referral link copied to clipboard!', 'Great', { duration: 3000 });
  }
}
