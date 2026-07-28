import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReferralService } from '../../core/services/referral.service';
import { OrderService } from '../../core/services/order.service';
import { ReferralStats, Reward } from '../../core/models/referral.model';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-referrals',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>Refer & Earn Free Laddus 🎁</h1>
          <p>Share sweetness with friends & earn 250g free laddus for every 5 referrals!</p>
        </div>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading && stats) {
        <!-- Referral Share Card -->
        <mat-card class="share-card">
          <div class="share-content">
            <div class="share-info">
              <h2>Your Unique Referral Link</h2>
              <p>Friends who register with your link get access to organic laddus, and you earn free rewards on their first delivery!</p>

              <div class="share-box">
                <input type="text" [value]="stats.referralLink" readonly #refInput />
                <button mat-raised-button color="primary" (click)="copyLink(refInput.value)">
                  <mat-icon>content_copy</mat-icon> Copy
                </button>
                <button mat-raised-button class="whatsapp-btn" (click)="shareWhatsapp(stats.referralLink)">
                  <mat-icon>share</mat-icon> Share on WhatsApp
                </button>
              </div>
            </div>

            <div class="progress-box">
              <div class="milestone-text">
                <span>Milestone Progress</span>
                <strong>{{ stats.confirmedReferrals }}/5 Confirmed</strong>
              </div>
              <mat-progress-bar mode="determinate" [value]="(stats.confirmedReferrals / 5) * 100" class="custom-progress"></mat-progress-bar>
              <small class="progress-note">
                @if (stats.confirmedReferrals === 0) {
                  Share your link to get your first referral!
                } @else {
                  Only {{ 5 - stats.confirmedReferrals }} more confirmed referral(s) needed for 250g free laddus!
                }
              </small>
            </div>
          </div>
        </mat-card>

        <!-- Stats Overview Row -->
        <div class="stats-row">
          <mat-card class="mini-stat">
            <span class="stat-num">{{ stats.totalReferrals }}</span>
            <span class="stat-label">Total Referrals</span>
          </mat-card>
          <mat-card class="mini-stat">
            <span class="stat-num text-success">{{ stats.confirmedReferrals }}</span>
            <span class="stat-label">Confirmed (First Delivery Paid)</span>
          </mat-card>
          <mat-card class="mini-stat">
            <span class="stat-num text-warn">{{ stats.pendingReferrals }}</span>
            <span class="stat-label">Pending First Order</span>
          </mat-card>
          <mat-card class="mini-stat">
            <span class="stat-num text-indigo">{{ rewards.length }}</span>
            <span class="stat-label">Total Earned Rewards</span>
          </mat-card>
        </div>

        <!-- Rewards & Referral History Tabs -->
        <mat-card class="tabs-card">
          <mat-tab-group animationDuration="200ms">
            <!-- Rewards Tab -->
            <mat-tab label="My Rewards">
              <div class="tab-content">
                @if (rewards.length === 0) {
                  <div class="empty-tab">
                    <p>No rewards earned yet. Reach 5 confirmed referrals to unlock your first 250g free reward!</p>
                  </div>
                } @else {
                  <table mat-table [dataSource]="rewards" class="full-width">
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef>Reward #</th>
                      <td mat-cell *matCellDef="let r">#{{ r.id }}</td>
                    </ng-container>

                    <ng-container matColumnDef="grams">
                      <th mat-header-cell *matHeaderCellDef>Reward Amount</th>
                      <td mat-cell *matCellDef="let r">
                        <strong class="reward-grams">🎁 {{ r.grams }}g Free Laddus</strong>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="reason">
                      <th mat-header-cell *matHeaderCellDef>Reason</th>
                      <td mat-cell *matCellDef="let r">{{ r.reason }}</td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let r">
                        <mat-chip-option [selectable]="false" [ngClass]="r.status === 'APPLIED' ? 'status-applied' : 'status-pending'">
                          {{ r.status }}
                        </mat-chip-option>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Action</th>
                      <td mat-cell *matCellDef="let r">
                        @if (r.status === 'PENDING') {
                          <button mat-raised-button color="accent" (click)="openApplyRewardDialog(r.id)">
                            Apply to Order
                          </button>
                        } @else {
                          <span class="text-muted">Applied to Order #{{ r.appliedToOrderId }}</span>
                        }
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="rewardColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: rewardColumns;"></tr>
                  </table>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-section {
      margin-bottom: 28px;
      h1 { font-size: 28px; font-weight: 700; color: #1e1b4b; margin-bottom: 4px; }
      p { color: #64748b; font-size: 15px; }
    }
    .share-card {
      border-radius: 20px !important;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
      border: 1px solid #bbf7d0;
      padding: 24px;
      margin-bottom: 28px;
    }
    .share-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 32px;
      flex-wrap: wrap;
    }
    .share-info {
      flex: 1;
      min-width: 320px;

      h2 { font-size: 20px; font-weight: 700; color: #14532d; margin-bottom: 6px; }
      p { font-size: 14px; color: #166534; margin-bottom: 16px; }
    }
    .share-box {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      input {
        flex: 1;
        min-width: 200px;
        padding: 10px 14px;
        border-radius: 8px;
        border: 1px solid #86efac;
        background: #ffffff;
        font-family: monospace;
        font-size: 14px;
        color: #14532d;
      }
    }
    .whatsapp-btn {
      background-color: #25d366 !important;
      color: #ffffff !important;
      font-weight: 600;
    }
    .progress-box {
      width: 300px;
      background: #ffffff;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #86efac;

      .milestone-text {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #15803d;
        margin-bottom: 8px;
      }
      .custom-progress { height: 10px; border-radius: 5px; }
      .progress-note { font-size: 12px; color: #166534; margin-top: 8px; display: block; }
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .mini-stat {
      border-radius: 16px !important;
      padding: 20px;
      text-align: center;

      .stat-num { font-size: 32px; font-weight: 800; color: #0f172a; display: block; margin-bottom: 4px; }
      .stat-label { font-size: 13px; color: #64748b; font-weight: 500; }
      .text-success { color: #10b981; }
      .text-warn { color: #f59e0b; }
      .text-indigo { color: #4338ca; }
    }
    .tabs-card {
      border-radius: 20px !important;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
    }
    .tab-content { padding: 24px; }
    .full-width { width: 100%; }
    .reward-grams { color: #15803d; font-size: 15px; }
    .status-applied { background-color: #e0e7ff !important; color: #3730a3 !important; }
    .status-pending { background-color: #fef3c7 !important; color: #92400e !important; }
    .text-muted { color: #64748b; font-size: 13px; }
    .empty-tab { text-align: center; padding: 40px; color: #64748b; }
  `]
})
export class MyReferralsComponent implements OnInit {
  private referralService = inject(ReferralService);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  stats: ReferralStats | null = null;
  rewards: Reward[] = [];
  customerOrders: Order[] = [];

  rewardColumns: string[] = ['id', 'grams', 'reason', 'status', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.referralService.getMyStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    this.referralService.getMyRewards().subscribe({
      next: (data) => {
        this.rewards = data;
      }
    });

    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.customerOrders = data;
      }
    });
  }

  copyLink(link: string): void {
    navigator.clipboard.writeText(link);
    this.snackBar.open('Referral link copied to clipboard!', 'Great', { duration: 3000 });
  }

  shareWhatsapp(link: string): void {
    const text = encodeURIComponent(`Check out Laddu Kadai for delicious hand-rolled organic laddus! Register with my link: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  openApplyRewardDialog(rewardId: number): void {
    if (this.customerOrders.length === 0) {
      alert('You have no orders yet. Place an order first to apply your free reward!');
      return;
    }

    const orderIdStr = prompt(`Select Order ID to apply 250g free laddu reward:\nAvailable Order IDs: ${this.customerOrders.map(o => '#' + o.id).join(', ')}`);
    if (orderIdStr) {
      const orderId = Number(orderIdStr.replace('#', ''));
      if (orderId) {
        this.referralService.applyReward(rewardId, orderId).subscribe({
          next: () => {
            this.snackBar.open('250g Reward applied to Order #' + orderId, 'Close', { duration: 4000 });
            this.loadData();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Failed to apply reward', 'Dismiss', { duration: 4000 });
          }
        });
      }
    }
  }
}
