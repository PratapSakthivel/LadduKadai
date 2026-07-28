import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>My Orders History</h1>
          <p>Track your sweet orders & delivery status</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/customer/instant-order">
          <mat-icon>add</mat-icon> Place New Order
        </button>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading && orders.length === 0) {
        <mat-card class="empty-card">
          <mat-icon class="empty-icon">shopping_bag</mat-icon>
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet. Try our delicious organic laddus today!</p>
          <button mat-raised-button color="primary" routerLink="/customer/catalog">Browse Sweets</button>
        </mat-card>
      }

      @if (!isLoading && orders.length > 0) {
        <mat-card class="table-card">
          <div class="table-responsive">
            <table mat-table [dataSource]="orders" class="full-width">
              <!-- Order ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Order #</th>
                <td mat-cell *matCellDef="let order">#{{ order.id }}</td>
              </ng-container>

              <!-- Product Column -->
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let order">
                  <strong>{{ order.productName }}</strong>
                  <br />
                  <small class="text-muted">₹{{ order.pricePerKg }}/kg</small>
                </td>
              </ng-container>

              <!-- Quantity Column -->
              <ng-container matColumnDef="quantityKg">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let order">{{ order.quantityKg }} kg</td>
              </ng-container>

              <!-- Total Column -->
              <ng-container matColumnDef="totalAmount">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let order">
                  <span class="amount-text">₹{{ order.totalAmount }}</span>
                </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="orderType">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let order">
                  <mat-chip-option [selectable]="false" class="type-chip">
                    {{ order.orderType }}
                  </mat-chip-option>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let order">
                  <mat-chip-option [selectable]="false" [ngClass]="getStatusClass(order.status)">
                    {{ order.status }}
                  </mat-chip-option>
                </td>
              </ng-container>

              <!-- Address Column -->
              <ng-container matColumnDef="deliveryAddress">
                <th mat-header-cell *matHeaderCellDef>Delivery Address</th>
                <td mat-cell *matCellDef="let order" class="address-cell">{{ order.deliveryAddress }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let order">
                  @if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
                    <button mat-button color="warn" (click)="cancelOrder(order.id)">
                      <mat-icon>cancel</mat-icon> Cancel
                    </button>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;

      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #1e1b4b;
        margin-bottom: 4px;
      }
      p {
        color: #64748b;
        font-size: 15px;
      }
    }
    .table-card {
      border-radius: 16px !important;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .full-width {
      width: 100%;
    }
    .amount-text {
      font-weight: 700;
      color: #0f172a;

    }
    .text-muted {
      color: #64748b;
      font-size: 12px;
    }
    .address-cell {
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .type-chip {
      font-size: 11px;
      font-weight: 600;
      background-color: #f1f5f9 !important;
      color: #475569 !important;
    }
    .status-pending { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-confirmed { background-color: #e0e7ff !important; color: #3730a3 !important; }
    .status-dispatched { background-color: #e0f2fe !important; color: #075985 !important; }
    .status-delivered { background-color: #dcfce7 !important; color: #166534 !important; }
    .status-cancelled { background-color: #f1f5f9 !important; color: #64748b !important; }
    .status-rejected { background-color: #fee2e2 !important; color: #991b1b !important; }

    .empty-card {
      text-align: center;
      padding: 60px 20px;
      border-radius: 16px !important;

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #94a3b8;
        margin-bottom: 16px;
      }
      h3 {
        font-size: 20px;
        color: #1e293b;
        margin-bottom: 8px;
      }
      p {
        color: #64748b;
        margin-bottom: 24px;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  orders: Order[] = [];
  displayedColumns: string[] = ['id', 'productName', 'quantityKg', 'totalAmount', 'orderType', 'status', 'deliveryAddress', 'actions'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  cancelOrder(id: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          this.snackBar.open('Order cancelled successfully', 'Close', { duration: 3000 });
          this.loadOrders();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to cancel order', 'Dismiss', { duration: 3000 });
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'DISPATCHED': return 'status-dispatched';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }
}
