import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReferralService } from '../../core/services/referral.service';
import { ReferralStats } from '../../core/models/referral.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-referral-leaderboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="header-section">
        <h1>Referral Leaderboard 🏆</h1>
        <p>Top customers who brought the most friends to Laddu Kadai</p>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading && leaderboard.length > 0) {
        <!-- Podium Top 3 -->
        <div class="podium-section">
          @if (leaderboard.length >= 2) {
            <mat-card class="podium-card podium-second">
              <div class="rank-badge">🥈</div>
              <div class="podium-name">{{ leaderboard[1].referralLink }}</div>
              <div class="podium-count">{{ leaderboard[1].confirmedReferrals }} Referrals</div>
              <div class="podium-bar bar-2"></div>
            </mat-card>
          }
          @if (leaderboard.length >= 1) {
            <mat-card class="podium-card podium-first">
              <div class="rank-badge">🥇</div>
              <div class="podium-name">Top Referrer</div>
              <div class="podium-count">{{ leaderboard[0].confirmedReferrals }} Referrals</div>
              <div class="podium-code">Code: {{ leaderboard[0].referralCode }}</div>
              <div class="podium-bar bar-1"></div>
            </mat-card>
          }
          @if (leaderboard.length >= 3) {
            <mat-card class="podium-card podium-third">
              <div class="rank-badge">🥉</div>
              <div class="podium-name">{{ leaderboard[2].referralLink }}</div>
              <div class="podium-count">{{ leaderboard[2].confirmedReferrals }} Referrals</div>
              <div class="podium-bar bar-3"></div>
            </mat-card>
          }
        </div>

        <!-- Full Leaderboard Table -->
        <mat-card class="table-card">
          <h3>Full Rankings</h3>
          <table mat-table [dataSource]="leaderboard" class="full-width">
            <ng-container matColumnDef="rank">
              <th mat-header-cell *matHeaderCellDef>Rank</th>
              <td mat-cell *matCellDef="let entry; let i = index">
                <span class="rank-label">{{ i + 1 }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="referralCode">
              <th mat-header-cell *matHeaderCellDef>Referral Code</th>
              <td mat-cell *matCellDef="let entry"><code class="code-badge">{{ entry.referralCode }}</code></td>
            </ng-container>
            <ng-container matColumnDef="confirmed">
              <th mat-header-cell *matHeaderCellDef>Confirmed Referrals</th>
              <td mat-cell *matCellDef="let entry"><span class="confirmed-count">{{ entry.confirmedReferrals }}</span></td>
            </ng-container>
            <ng-container matColumnDef="pending">
              <th mat-header-cell *matHeaderCellDef>Pending Referrals</th>
              <td mat-cell *matCellDef="let entry">{{ entry.pendingReferrals }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let entry">{{ entry.totalReferrals }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="leaderboardColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: leaderboardColumns;"></tr>
          </table>
        </mat-card>
      }

      @if (!isLoading && leaderboard.length === 0) {
        <mat-card class="empty-card">
          <mat-icon class="empty-icon">emoji_events</mat-icon>
          <h3>No Referrals Yet</h3>
          <p>Be the first to refer friends to Laddu Kadai and earn delicious rewards!</p>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
    .header-section { margin-bottom: 40px; h1 { font-size: 32px; font-weight: 800; color: #1e1b4b; margin-bottom: 6px; } p { color: #64748b; font-size: 15px; } }
    .podium-section {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 20px;
      margin-bottom: 40px;
    }
    .podium-card {
      padding: 20px 24px;
      border-radius: 20px !important;
      text-align: center;
      min-width: 200px;

      .rank-badge { font-size: 40px; margin-bottom: 8px; }
      .podium-name { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .podium-code { font-size: 12px; color: #64748b; margin-bottom: 8px; }
      .podium-count { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
      .podium-bar { height: 8px; border-radius: 4px; width: 100%; }
      .bar-1 { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
      .bar-2 { background: linear-gradient(90deg, #94a3b8, #64748b); }
      .bar-3 { background: linear-gradient(90deg, #fb923c, #ea580c); }
    }
    .podium-first { border: 2px solid #fbbf24; box-shadow: 0 8px 25px rgba(251, 191, 36, 0.2) !important; transform: scale(1.05); }
    .podium-second { border: 2px solid #94a3b8; }
    .podium-third { border: 2px solid #fb923c; }
    .podium-first .podium-count { color: #d97706; }
    .podium-second .podium-count { color: #475569; }
    .podium-third .podium-count { color: #ea580c; }
    .table-card { border-radius: 16px !important; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 16px; } }
    .full-width { width: 100%; }
    .rank-label { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #e0e7ff; color: #3730a3; font-weight: 800; font-size: 14px; }
    .code-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; color: #0f172a; letter-spacing: 1px; }
    .confirmed-count { font-size: 18px; font-weight: 800; color: #10b981; }
    .empty-card { text-align: center; padding: 60px 20px; border-radius: 16px !important; .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #fbbf24; margin-bottom: 16px; } h3 { font-size: 20px; color: #1e293b; } p { color: #64748b; } }
  `]
})
export class ReferralLeaderboardComponent implements OnInit {
  private referralService = inject(ReferralService);

  isLoading = true;
  leaderboard: ReferralStats[] = [];
  leaderboardColumns: string[] = ['rank', 'referralCode', 'confirmed', 'pending', 'total'];

  ngOnInit(): void {
    this.referralService.getLeaderboard().subscribe({
      next: (data) => { this.leaderboard = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
}
