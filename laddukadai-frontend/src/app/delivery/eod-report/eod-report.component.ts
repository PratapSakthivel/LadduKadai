import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { Delivery, EodReport } from '../../core/models/delivery.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-eod-report',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatSnackBarModule, LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <h1>EOD Report — End of Day</h1>
        <p>Review today's deliveries and submit your cash collection report</p>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading) {
        <!-- Today's Summary -->
        <mat-card class="summary-card">
          <h2>Today's Summary</h2>
          <div class="summary-grid">
            <div class="summary-item emerald">
              <span class="s-value">{{ deliveredCount }}</span>
              <span class="s-label">Delivered</span>
            </div>
            <div class="summary-item amber">
              <span class="s-value">{{ notHomeCount }}</span>
              <span class="s-label">Not Home</span>
            </div>
            <div class="summary-item red">
              <span class="s-value">{{ rejectedCount }}</span>
              <span class="s-label">Rejected</span>
            </div>
            <div class="summary-item indigo">
              <span class="s-value">₹{{ totalCash }}</span>
              <span class="s-label">Total Cash</span>
            </div>
          </div>

          @if (!todayReportSubmitted) {
            <button mat-raised-button color="primary" class="submit-btn" [disabled]="isSubmitting" (click)="submitEod()">
              @if (isSubmitting) {
                <span>Submitting Report...</span>
              } @else {
                <ng-container>
                  <mat-icon>assignment_turned_in</mat-icon>
                  <span>Submit EOD Report</span>
                </ng-container>
              }
            </button>
          } @else {
            <div class="submitted-banner">
              <mat-icon>check_circle</mat-icon>
              <span>EOD Report Submitted Successfully Today!</span>
            </div>
          }
        </mat-card>

        <!-- Previous EOD Reports -->
        <mat-card class="history-card">
          <h3>My Previous EOD Reports</h3>
          @if (myEodReports.length === 0) {
            <p class="no-data">No previous reports found.</p>
          }
          @if (myEodReports.length > 0) {
            <table mat-table [dataSource]="myEodReports" class="full-width">
              <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r"><strong>{{ r.reportDate }}</strong></td></ng-container>
              <ng-container matColumnDef="cash"><th mat-header-cell *matHeaderCellDef>Cash Collected</th><td mat-cell *matCellDef="let r" class="amount-text">₹{{ r.totalCash }}</td></ng-container>
              <ng-container matColumnDef="deliveries"><th mat-header-cell *matHeaderCellDef>Delivered</th><td mat-cell *matCellDef="let r" class="success-text">{{ r.totalDeliveries }}</td></ng-container>
              <ng-container matColumnDef="notHome"><th mat-header-cell *matHeaderCellDef>Not Home</th><td mat-cell *matCellDef="let r" class="warn-text">{{ r.totalNotHome }}</td></ng-container>
              <ng-container matColumnDef="rejected"><th mat-header-cell *matHeaderCellDef>Rejected</th><td mat-cell *matCellDef="let r" class="danger-text">{{ r.totalRejected }}</td></ng-container>
              <ng-container matColumnDef="verified">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">
                  @if (r.isVerified) {
                    <mat-chip-option [selectable]="false" class="verified-chip">✓ Verified</mat-chip-option>
                  } @else {
                    <mat-chip-option [selectable]="false" class="pending-chip">Pending Review</mat-chip-option>
                  }
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="eodColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: eodColumns;"></tr>
            </table>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1000px; margin: 0 auto; }
    .header-section { margin-bottom: 28px; h1 { font-size: 28px; font-weight: 700; color: #1e1b4b; margin-bottom: 4px; } p { color: #64748b; } }
    .summary-card { border-radius: 20px !important; padding: 28px; margin-bottom: 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; h2 { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 20px; } }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    @media (max-width: 700px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
    .summary-item { padding: 20px; border-radius: 14px; text-align: center; display: flex; flex-direction: column; .s-value { font-size: 32px; font-weight: 800; margin-bottom: 6px; } .s-label { font-size: 13px; font-weight: 600; } }
    .emerald { background: #f0fdf4; .s-value { color: #15803d; } .s-label { color: #166534; } }
    .amber { background: #fffbeb; .s-value { color: #d97706; } .s-label { color: #92400e; } }
    .red { background: #fff5f5; .s-value { color: #dc2626; } .s-label { color: #991b1b; } }
    .indigo { background: #eef2ff; .s-value { color: #3730a3; } .s-label { color: #4338ca; } }
    .submit-btn { height: 50px; font-size: 16px; font-weight: 700; border-radius: 12px; display: flex; align-items: center; gap: 8px; }
    .submitted-banner { display: flex; align-items: center; gap: 10px; background: #dcfce7; color: #15803d; font-weight: 700; font-size: 16px; padding: 16px 20px; border-radius: 12px; mat-icon { color: #15803d; } }
    .history-card { border-radius: 20px !important; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 16px; } }
    .full-width { width: 100%; }
    .amount-text { font-weight: 700; color: #4338ca; }
    .success-text { color: #10b981; font-weight: 700; }
    .warn-text { color: #f59e0b; font-weight: 700; }
    .danger-text { color: #ef4444; font-weight: 700; }
    .verified-chip { background-color: #dcfce7 !important; color: #166534 !important; font-weight: 700; }
    .pending-chip { background-color: #fef3c7 !important; color: #92400e !important; font-weight: 700; }
    .no-data { text-align: center; padding: 24px; color: #94a3b8; }
  `]
})
export class EodReportComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  isSubmitting = false;
  deliveries: Delivery[] = [];
  myEodReports: EodReport[] = [];
  todayReportSubmitted = false;
  deliveredCount = 0;
  notHomeCount = 0;
  rejectedCount = 0;
  totalCash = 0;
  todayStr = new Date().toISOString().split('T')[0];
  eodColumns: string[] = ['date', 'cash', 'deliveries', 'notHome', 'rejected', 'verified'];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.isLoading = true;
    let loaded = 0;
    const checkDone = () => { if (++loaded === 2) this.isLoading = false; };

    this.deliveryService.getTodayDeliveries().subscribe({
      next: (data) => {
        this.deliveries = data;
        this.deliveredCount = data.filter(d => d.status === 'DELIVERED').length;
        this.notHomeCount = data.filter(d => d.status === 'NOT_HOME').length;
        this.rejectedCount = data.filter(d => d.status === 'REJECTED').length;
        this.totalCash = data.filter(d => d.status === 'DELIVERED').reduce((sum, d) => sum + (d.amountToCollect || 0), 0);
        checkDone();
      }, error: () => checkDone()
    });

    const currentUserName = this.authService.getCurrentUser()?.name || '';
    this.deliveryService.getAllEodReports().subscribe({
      next: (reports) => {
        this.myEodReports = reports.filter(r => r.deliveryManName === currentUserName);
        this.todayReportSubmitted = this.myEodReports.some(r => r.reportDate === this.todayStr);
        checkDone();
      }, error: () => checkDone()
    });
  }

  submitEod(): void {
    this.isSubmitting = true;
    this.deliveryService.submitEodReport().subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('EOD Report submitted successfully!', 'Close', { duration: 4000 });
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err.error?.message || 'Failed to submit EOD Report', 'Dismiss', { duration: 4000 });
      }
    });
  }
}
