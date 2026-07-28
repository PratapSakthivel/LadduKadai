import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeliveryService } from '../../core/services/delivery.service';
import { OrderService } from '../../core/services/order.service';
import { Delivery, EodReport } from '../../core/models/delivery.model';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatTabsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatSnackBarModule, LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>Deliveries Management</h1>
          <p>Assign deliveries and verify end-of-day cash reports from delivery men</p>
        </div>
      </div>

      <mat-card class="tabs-card">
        <mat-tab-group animationDuration="200ms">
          <!-- Tab 1: Pending Assignments -->
          <mat-tab label="Pending Assignments ({{ confirmedOrders.length }})">
            <div class="tab-content">
              <app-loading-spinner [isLoading]="isLoadingOrders"></app-loading-spinner>
              @if (!isLoadingOrders && confirmedOrders.length === 0) {
                <div class="empty-tab">
                  <mat-icon>check_circle</mat-icon>
                  <p>No orders awaiting delivery assignment!</p>
                </div>
              }
              @if (!isLoadingOrders && confirmedOrders.length > 0) {
                <table mat-table [dataSource]="confirmedOrders" class="full-width">
                  <ng-container matColumnDef="id"><th mat-header-cell *matHeaderCellDef>#</th><td mat-cell *matCellDef="let o">#{{ o.id }}</td></ng-container>
                  <ng-container matColumnDef="customer"><th mat-header-cell *matHeaderCellDef>Customer</th><td mat-cell *matCellDef="let o">{{ o.customerName }}<br /><small>{{ o.customerPhone }}</small></td></ng-container>
                  <ng-container matColumnDef="product"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let o">{{ o.productName }} — {{ o.quantityKg }} kg</td></ng-container>
                  <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let o" class="amount-text">₹{{ o.totalAmount }}</td></ng-container>
                  <ng-container matColumnDef="address"><th mat-header-cell *matHeaderCellDef>Delivery Address</th><td mat-cell *matCellDef="let o" class="address-cell">{{ o.deliveryAddress }}</td></ng-container>
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Action</th>
                    <td mat-cell *matCellDef="let o">
                      <button mat-raised-button color="primary" (click)="assignDelivery(o.id)">
                        <mat-icon>local_shipping</mat-icon> Assign Delivery
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['id','customer','product','amount','address','actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['id','customer','product','amount','address','actions'];"></tr>
                </table>
              }
            </div>
          </mat-tab>

          <!-- Tab 2: EOD Reports -->
          <mat-tab label="EOD Reports ({{ eodReports.length }})">
            <div class="tab-content">
              <app-loading-spinner [isLoading]="isLoadingEod"></app-loading-spinner>
              @if (!isLoadingEod && eodReports.length === 0) {
                <div class="empty-tab">
                  <mat-icon>assignment</mat-icon>
                  <p>No EOD reports submitted yet.</p>
                </div>
              }
              @if (!isLoadingEod && eodReports.length > 0) {
                <table mat-table [dataSource]="eodReports" class="full-width">
                  <ng-container matColumnDef="deliveryMan"><th mat-header-cell *matHeaderCellDef>Delivery Man</th><td mat-cell *matCellDef="let r"><strong>{{ r.deliveryManName }}</strong></td></ng-container>
                  <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.reportDate }}</td></ng-container>
                  <ng-container matColumnDef="cash"><th mat-header-cell *matHeaderCellDef>Total Cash</th><td mat-cell *matCellDef="let r" class="amount-text">₹{{ r.totalCash }}</td></ng-container>
                  <ng-container matColumnDef="deliveries"><th mat-header-cell *matHeaderCellDef>Delivered</th><td mat-cell *matCellDef="let r" class="success-text">{{ r.totalDeliveries }}</td></ng-container>
                  <ng-container matColumnDef="notHome"><th mat-header-cell *matHeaderCellDef>Not Home</th><td mat-cell *matCellDef="let r" class="warn-text">{{ r.totalNotHome }}</td></ng-container>
                  <ng-container matColumnDef="rejected"><th mat-header-cell *matHeaderCellDef>Rejected</th><td mat-cell *matCellDef="let r" class="danger-text">{{ r.totalRejected }}</td></ng-container>
                  <ng-container matColumnDef="verified">
                    <th mat-header-cell *matHeaderCellDef>Verified</th>
                    <td mat-cell *matCellDef="let r">
                      @if (r.isVerified) {
                        <mat-icon color="primary">verified</mat-icon>
                      } @else {
                        <button mat-button color="accent" (click)="verifyEod(r.id)">Verify</button>
                      }
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="eodColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: eodColumns;" [ngClass]="!row.isVerified ? 'unverified-row' : ''"></tr>
                </table>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
    .header-section { margin-bottom: 28px; h1 { font-size: 28px; font-weight: 700; color: #1e1b4b; } p { color: #64748b; } }
    .tabs-card { border-radius: 20px !important; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; }
    .tab-content { padding: 24px; }
    .full-width { width: 100%; }
    .amount-text { font-weight: 700; color: #4338ca; }
    .success-text { color: #10b981; font-weight: 700; }
    .warn-text { color: #f59e0b; font-weight: 700; }
    .danger-text { color: #ef4444; font-weight: 700; }
    .address-cell { max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .unverified-row { background: #fffbeb !important; }
    .empty-tab { text-align: center; padding: 60px; color: #94a3b8; mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; } }
  `]
})
export class DeliveriesComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  isLoadingOrders = true;
  isLoadingEod = true;
  confirmedOrders: Order[] = [];
  eodReports: EodReport[] = [];
  eodColumns: string[] = ['deliveryMan', 'date', 'cash', 'deliveries', 'notHome', 'rejected', 'verified'];

  ngOnInit(): void {
    this.loadConfirmedOrders();
    this.loadEodReports();
  }

  loadConfirmedOrders(): void {
    this.isLoadingOrders = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.confirmedOrders = orders.filter(o => o.status === 'CONFIRMED' && !o.deliveryManName);
        this.isLoadingOrders = false;
      },
      error: () => { this.isLoadingOrders = false; }
    });
  }

  loadEodReports(): void {
    this.isLoadingEod = true;
    this.deliveryService.getAllEodReports().subscribe({
      next: (reports) => { this.eodReports = reports; this.isLoadingEod = false; },
      error: () => { this.isLoadingEod = false; }
    });
  }

  assignDelivery(orderId: number): void {
    const deliveryManId = prompt('Enter Delivery Man User ID to assign:');
    if (deliveryManId && !isNaN(Number(deliveryManId))) {
      this.deliveryService.assignDelivery(orderId, Number(deliveryManId)).subscribe({
        next: () => {
          this.snackBar.open('Delivery assigned successfully!', 'Close', { duration: 3000 });
          this.loadConfirmedOrders();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Failed to assign', 'Dismiss', { duration: 3000 })
      });
    }
  }

  verifyEod(id: number): void {
    this.deliveryService.verifyEodReport(id).subscribe({
      next: () => { this.snackBar.open('EOD Report verified!', 'Close', { duration: 3000 }); this.loadEodReports(); },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed to verify', 'Dismiss', { duration: 3000 })
    });
  }
}
