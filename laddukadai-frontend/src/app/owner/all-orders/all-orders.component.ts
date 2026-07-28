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
import { OrderService } from '../../core/services/order.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatFormFieldModule, MatChipsModule, MatSnackBarModule, LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>All Orders</h1>
          <p>View, confirm, cancel, and assign deliveries for all customer orders</p>
        </div>
        <div class="filter-area">
          <mat-form-field appearance="outline" class="status-filter">
            <mat-label>Filter by Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="PENDING">Pending</mat-option>
              <mat-option value="CONFIRMED">Confirmed</mat-option>
              <mat-option value="DISPATCHED">Dispatched</mat-option>
              <mat-option value="DELIVERED">Delivered</mat-option>
              <mat-option value="CANCELLED">Cancelled</mat-option>
              <mat-option value="REJECTED">Rejected</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading) {
        <mat-card class="table-card">
          <div class="table-responsive">
            <table mat-table [dataSource]="filteredOrders" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Order #</th>
                <td mat-cell *matCellDef="let o"><strong>#{{ o.id }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let o">
                  <strong>{{ o.customerName }}</strong><br />
                  <small class="text-muted">{{ o.customerPhone }}</small>
                </td>
              </ng-container>
              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let o">
                  {{ o.productName }}<br />
                  <small>{{ o.quantityKg }} kg × ₹{{ o.pricePerKg }}</small>
                </td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let o"><span class="amount">₹{{ o.totalAmount }}</span></td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let o">
                  <mat-chip-option [selectable]="false" [ngClass]="getStatusClass(o.status)">{{ o.status }}</mat-chip-option>
                </td>
              </ng-container>
              <ng-container matColumnDef="deliveryMan">
                <th mat-header-cell *matHeaderCellDef>Delivery Man</th>
                <td mat-cell *matCellDef="let o">{{ o.deliveryManName || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let o">
                  <div class="row-actions">
                    @if (o.status === 'PENDING') {
                      <button mat-button color="primary" (click)="confirmOrder(o.id)">Confirm</button>
                    }
                    @if (o.status === 'CONFIRMED' && !o.deliveryManName) {
                      <button mat-button color="accent" (click)="assignDelivery(o.id)">Assign Delivery</button>
                    }
                    @if (o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED') {
                      <button mat-button color="warn" (click)="cancelOrder(o.id)">Cancel</button>
                    }
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          @if (filteredOrders.length === 0) {
            <p class="no-data">No orders found for the selected filter.</p>
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
    .row-actions { display: flex; gap: 4px; }
    .no-data { text-align: center; padding: 32px; color: #94a3b8; }
    .status-pending { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-confirmed { background-color: #e0e7ff !important; color: #3730a3 !important; }
    .status-dispatched { background-color: #e0f2fe !important; color: #075985 !important; }
    .status-delivered { background-color: #dcfce7 !important; color: #166534 !important; }
    .status-cancelled { background-color: #f1f5f9 !important; color: #64748b !important; }
    .status-rejected { background-color: #fee2e2 !important; color: #991b1b !important; }
  `]
})
export class AllOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private deliveryService = inject(DeliveryService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  statusFilter = '';
  displayedColumns: string[] = ['id', 'customer', 'product', 'total', 'status', 'deliveryMan', 'actions'];

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => { this.orders = data; this.filteredOrders = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilter(): void {
    this.filteredOrders = this.statusFilter ? this.orders.filter(o => o.status === this.statusFilter) : this.orders;
  }

  confirmOrder(id: number): void {
    this.orderService.confirmOrder(id).subscribe({ next: () => { this.snackBar.open('Order confirmed!', 'Close', { duration: 3000 }); this.loadOrders(); }, error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Dismiss', { duration: 3000 }) });
  }

  cancelOrder(id: number): void {
    if (confirm('Cancel this order?')) {
      this.orderService.cancelOrder(id).subscribe({ next: () => { this.snackBar.open('Order cancelled!', 'Close', { duration: 3000 }); this.loadOrders(); } });
    }
  }

  assignDelivery(orderId: number): void {
    const deliveryManId = prompt('Enter Delivery Man User ID:');
    if (deliveryManId && !isNaN(Number(deliveryManId))) {
      this.deliveryService.assignDelivery(orderId, Number(deliveryManId)).subscribe({
        next: () => { this.snackBar.open('Delivery assigned!', 'Close', { duration: 3000 }); this.loadOrders(); },
        error: (err) => this.snackBar.open(err.error?.message || 'Failed to assign delivery', 'Dismiss', { duration: 3000 })
      });
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { PENDING: 'status-pending', CONFIRMED: 'status-confirmed', DISPATCHED: 'status-dispatched', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled', REJECTED: 'status-rejected' };
    return map[status] || '';
  }
}
