import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { Delivery } from '../../core/models/delivery.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="dashboard-banner">
        <div>
          <h1>Good {{ greeting }}, {{ authService.getCurrentUser()?.name }}! 🛵</h1>
          <p>Today is {{ today }}. Here's your delivery overview.</p>
        </div>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading) {
        <div class="stats-grid">
          <mat-card class="stat-card border-indigo">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-indigo">local_shipping</mat-icon><span>Total Today</span></div>
              <div class="stat-value">{{ deliveries.length }}</div>
              <small>Deliveries assigned</small>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card border-emerald">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-emerald">done_all</mat-icon><span>Delivered</span></div>
              <div class="stat-value">{{ deliveredCount }}</div>
              <small class="text-success">Completed</small>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card border-amber">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-amber">schedule</mat-icon><span>Pending</span></div>
              <div class="stat-value">{{ pendingCount }}</div>
              <small>Awaiting delivery</small>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card border-purple">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-purple">payments</mat-icon><span>Cash Collected</span></div>
              <div class="stat-value">₹{{ cashCollected }}</div>
              <small>Today's earnings</small>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <mat-card class="action-card" routerLink="/delivery/today">
            <mat-icon color="primary">delivery_dining</mat-icon>
            <h3>Today's Deliveries</h3>
            <p>View all your deliveries and mark status</p>
          </mat-card>
          <mat-card class="action-card" routerLink="/delivery/eod">
            <mat-icon color="accent">assignment_turned_in</mat-icon>
            <h3>Submit EOD Report</h3>
            <p>Submit your end-of-day cash collection report</p>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1100px; margin: 0 auto; }
    .dashboard-banner { background: linear-gradient(135deg, #0f766e, #0d9488); color: #fff; padding: 32px; border-radius: 20px; margin-bottom: 32px; box-shadow: 0 10px 25px -5px rgba(15, 118, 110, 0.3); h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; } p { color: #99f6e4; font-size: 15px; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { border-radius: 16px !important; border-left: 4px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; }
    .stat-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; font-weight: 600; color: #64748b; }
    .stat-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .border-indigo { border-left-color: #4338ca; } .border-emerald { border-left-color: #10b981; } .border-amber { border-left-color: #f59e0b; } .border-purple { border-left-color: #8b5cf6; }
    .icon-indigo { color: #4338ca; } .icon-emerald { color: #10b981; } .icon-amber { color: #f59e0b; } .icon-purple { color: #8b5cf6; }
    .text-success { color: #10b981; }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .action-card { padding: 28px; border-radius: 20px !important; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; &:hover { transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0,0,0,0.08) !important; } mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 12px; } h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; } p { font-size: 13px; color: #64748b; } }
  `]
})
export class DeliveryDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private deliveryService = inject(DeliveryService);

  isLoading = true;
  deliveries: Delivery[] = [];
  deliveredCount = 0;
  pendingCount = 0;
  cashCollected = 0;
  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  ngOnInit(): void {
    this.deliveryService.getTodayDeliveries().subscribe({
      next: (data) => {
        this.deliveries = data;
        this.deliveredCount = data.filter(d => d.status === 'DELIVERED').length;
        this.pendingCount = data.filter(d => d.status === 'PENDING').length;
        this.cashCollected = data.filter(d => d.status === 'DELIVERED').reduce((sum, d) => sum + (d.amountToCollect || 0), 0);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
}
