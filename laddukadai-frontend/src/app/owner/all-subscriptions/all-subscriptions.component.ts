import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../core/services/subscription.service';
import { Subscription } from '../../core/models/subscription.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-all-subscriptions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatFormFieldModule, MatChipsModule, MatSnackBarModule, LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>All Subscriptions</h1>
          <p>Monitor and manage all customer recurring laddu delivery subscriptions</p>
        </div>
        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>Filter by Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="PAUSED">Paused</mat-option>
            <mat-option value="CANCELLED">Cancelled</mat-option>
            <mat-option value="EXPIRED">Expired</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading) {
        <mat-card class="table-card">
          <div class="table-responsive">
            <table mat-table [dataSource]="filteredSubs" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let s">#{{ s.id }}</td>
              </ng-container>
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let s"><strong>{{ s.customerName }}</strong><br /><small class="text-muted">{{ s.customerEmail }}</small></td>
              </ng-container>
              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let s">{{ s.productName }}<br /><small>{{ s.quantityKg }} kg / delivery</small></td>
              </ng-container>
              <ng-container matColumnDef="frequency">
                <th mat-header-cell *matHeaderCellDef>Frequency</th>
                <td mat-cell *matCellDef="let s">Every {{ s.frequencyDays }} days</td>
              </ng-container>
              <ng-container matColumnDef="nextDelivery">
                <th mat-header-cell *matHeaderCellDef>Next Delivery</th>
                <td mat-cell *matCellDef="let s"><strong>{{ s.nextDeliveryDate }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let s"><span class="amount">₹{{ s.totalAmountPerDelivery }}</span></td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let s">
                  <mat-chip-option [selectable]="false" [ngClass]="getStatusClass(s.status)">{{ s.status }}</mat-chip-option>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let s">
                  @if (s.status === 'ACTIVE') {
                    <button mat-button color="warn" (click)="cancelSub(s.id)">Cancel</button>
                  }
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          @if (filteredSubs.length === 0) {
            <p class="no-data">No subscriptions found.</p>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; h1 { font-size: 28px; font-weight: 700; color: #1e1b4b; } p { color: #64748b; } }
    .status-filter { width: 200px; }
    .table-card { border-radius: 16px !important; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; }
    .table-responsive { overflow-x: auto; }
    .full-width { width: 100%; }
    .amount { font-weight: 700; color: #4338ca; }
    .text-muted { color: #94a3b8; font-size: 12px; }
    .no-data { text-align: center; padding: 32px; color: #94a3b8; }
    .status-active { background-color: #dcfce7 !important; color: #166534 !important; }
    .status-paused { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-cancelled { background-color: #f1f5f9 !important; color: #64748b !important; }
    .status-expired { background-color: #fee2e2 !important; color: #991b1b !important; }
  `]
})
export class AllSubscriptionsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  subscriptions: Subscription[] = [];
  filteredSubs: Subscription[] = [];
  statusFilter = '';
  displayedColumns: string[] = ['id', 'customer', 'product', 'frequency', 'nextDelivery', 'amount', 'status', 'actions'];

  ngOnInit(): void { this.loadSubscriptions(); }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.subscriptionService.getAllSubscriptions().subscribe({
      next: (data) => { this.subscriptions = data; this.filteredSubs = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilter(): void {
    this.filteredSubs = this.statusFilter ? this.subscriptions.filter(s => s.status === this.statusFilter) : this.subscriptions;
  }

  cancelSub(id: number): void {
    if (confirm('Cancel this subscription?')) {
      this.subscriptionService.cancelSubscription(id).subscribe({
        next: () => { this.snackBar.open('Subscription cancelled!', 'Close', { duration: 3000 }); this.loadSubscriptions(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Failed to cancel', 'Dismiss', { duration: 3000 })
      });
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { ACTIVE: 'status-active', PAUSED: 'status-paused', CANCELLED: 'status-cancelled', EXPIRED: 'status-expired' };
    return map[status] || '';
  }
}
