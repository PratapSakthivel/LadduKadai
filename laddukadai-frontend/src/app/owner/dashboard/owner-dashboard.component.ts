import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { Order } from '../../core/models/order.model';
import { Product } from '../../core/models/product.model';
import { EodReport } from '../../core/models/delivery.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatChipsModule, MatSnackBarModule, LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="dashboard-banner">
        <div class="banner-text">
          <h1>Owner Dashboard 🏪</h1>
          <p>Welcome back, {{ authService.getCurrentUser()?.name }}. Here's your Laddu Kadai at a glance.</p>
        </div>
        <div class="banner-date">{{ today }}</div>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading) {
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card border-indigo">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-indigo">shopping_cart</mat-icon><span>Total Orders</span></div>
              <div class="stat-value">{{ allOrders.length }}</div>
              <small>{{ pendingOrdersCount }} pending confirmation</small>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card border-emerald">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-emerald">payments</mat-icon><span>Total Revenue</span></div>
              <div class="stat-value">₹{{ totalRevenue }}</div>
              <small>From delivered orders</small>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card border-amber">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-amber">inventory_2</mat-icon><span>Total Products</span></div>
              <div class="stat-value">{{ allProducts.length }}</div>
              <small class="warn-text">{{ lowStockProducts.length }} low on stock</small>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card border-purple">
            <mat-card-content>
              <div class="stat-header"><mat-icon class="icon-purple">autorenew</mat-icon><span>Active Subscriptions</span></div>
              <div class="stat-value">{{ activeSubscriptionsCount }}</div>
              <small>Recurring deliveries</small>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Low Stock Alert -->
        @if (lowStockProducts.length > 0) {
          <mat-card class="alert-card">
            <div class="alert-header">
              <mat-icon color="warn">warning</mat-icon>
              <h2>⚠️ Low Stock Alert ({{ lowStockProducts.length }} products)</h2>
            </div>
            <div class="low-stock-list">
              @for (product of lowStockProducts; track product.id) {
                <div class="stock-item">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="stock-qty warn-text">{{ product.stockKg }} kg remaining</span>
                  <button mat-stroked-button color="primary" (click)="quickUpdateStock(product)" size="small">
                    Update Stock
                  </button>
                </div>
              }
            </div>
          </mat-card>
        }

        <!-- Recent Orders & EOD Reports -->
        <div class="bottom-grid">
          <mat-card class="recent-card">
            <div class="section-header">
              <h3>Recent Orders</h3>
              <button mat-button color="primary" routerLink="/owner/orders">View All</button>
            </div>
            <table mat-table [dataSource]="recentOrders" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let o">#{{ o.id }}</td>
              </ng-container>
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let o">{{ o.customerName }}</td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let o">₹{{ o.totalAmount }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let o">
                  <mat-chip-option [selectable]="false" [ngClass]="getStatusClass(o.status)">{{ o.status }}</mat-chip-option>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let o">
                  @if (o.status === 'PENDING') {
                    <button mat-button color="primary" (click)="confirmOrder(o.id)">Confirm</button>
                  }
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['id','customer','amount','status','actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['id','customer','amount','status','actions'];"></tr>
            </table>
          </mat-card>

          <mat-card class="recent-card">
            <div class="section-header">
              <h3>Recent EOD Reports</h3>
              <button mat-button color="primary" routerLink="/owner/deliveries">View All</button>
            </div>
            @if (recentEodReports.length === 0) {
              <p class="no-data">No EOD reports submitted yet.</p>
            }
            @for (report of recentEodReports; track report.id) {
              <div class="eod-item">
                <div class="eod-info">
                  <strong>{{ report.deliveryManName }}</strong>
                  <small>{{ report.reportDate }}</small>
                </div>
                <div class="eod-stats">
                  <span>₹{{ report.totalCash }}</span>
                  <span>{{ report.totalDeliveries }} deliveries</span>
                </div>
                @if (!report.isVerified) {
                  <button mat-button color="accent" (click)="verifyEod(report.id)">Verify</button>
                }
                @if (report.isVerified) {
                  <mat-icon color="primary">verified</mat-icon>
                }
              </div>
            }
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
    .dashboard-banner {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: #fff;
      padding: 32px;
      border-radius: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      box-shadow: 0 10px 25px -5px rgba(30, 27, 75, 0.35);
      h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
      p { color: #a5b4fc; font-size: 15px; }
    }
    .banner-date { font-size: 14px; color: #c7d2fe; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 8px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 28px; }
    .stat-card { border-radius: 16px !important; border-left: 4px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; }
    .stat-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; font-weight: 600; color: #64748b; }
    .stat-value { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .border-indigo { border-left-color: #4338ca; }
    .border-emerald { border-left-color: #10b981; }
    .border-amber { border-left-color: #f59e0b; }
    .border-purple { border-left-color: #8b5cf6; }
    .icon-indigo { color: #4338ca; }
    .icon-emerald { color: #10b981; }
    .icon-amber { color: #f59e0b; }
    .icon-purple { color: #8b5cf6; }
    .warn-text { color: #dc2626; font-weight: 600; }
    .alert-card { border-radius: 16px !important; padding: 20px; border-left: 4px solid #ef4444; background: #fff7f7 !important; margin-bottom: 28px; }
    .alert-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; h2 { font-size: 17px; font-weight: 700; color: #991b1b; } }
    .low-stock-list { display: flex; flex-direction: column; gap: 10px; }
    .stock-item { display: flex; align-items: center; gap: 16px; background: #fef2f2; padding: 10px 16px; border-radius: 10px; }
    .product-name { flex: 1; font-weight: 600; color: #1e293b; }
    .stock-qty { font-weight: 700; min-width: 120px; }
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .bottom-grid { grid-template-columns: 1fr; } }
    .recent-card { border-radius: 16px !important; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; }
    .section-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 0; h3 { font-size: 17px; font-weight: 700; color: #1e293b; } }
    .full-width { width: 100%; }
    .eod-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    .eod-info { flex: 1; display: flex; flex-direction: column; strong { font-weight: 600; } small { color: #64748b; } }
    .eod-stats { display: flex; gap: 12px; font-size: 14px; font-weight: 600; color: #1e293b; }
    .no-data { text-align: center; color: #94a3b8; padding: 24px; }
    .status-pending { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-confirmed { background-color: #e0e7ff !important; color: #3730a3 !important; }
    .status-delivered { background-color: #dcfce7 !important; color: #166534 !important; }
    .status-cancelled { background-color: #f1f5f9 !important; color: #64748b !important; }
    .status-rejected { background-color: #fee2e2 !important; color: #991b1b !important; }
  `]
})
export class OwnerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private subscriptionService = inject(SubscriptionService);
  private deliveryService = inject(DeliveryService);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  allOrders: Order[] = [];
  allProducts: Product[] = [];
  recentOrders: Order[] = [];
  recentEodReports: EodReport[] = [];
  lowStockProducts: Product[] = [];
  activeSubscriptionsCount = 0;
  totalRevenue = 0;
  pendingOrdersCount = 0;
  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.isLoading = true;
    let loaded = 0;
    const checkDone = () => { if (++loaded === 4) this.isLoading = false; };

    this.orderService.getAllOrders().subscribe({ next: (orders) => {
      this.allOrders = orders;
      this.recentOrders = orders.slice(0, 5);
      this.pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
      this.totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0);
      checkDone();
    }, error: () => checkDone() });

    this.productService.getAllProducts().subscribe({ next: (products) => {
      this.allProducts = products;
      this.lowStockProducts = products.filter(p => p.stockKg <= 2);
      checkDone();
    }, error: () => checkDone() });

    this.subscriptionService.getAllSubscriptions().subscribe({ next: (subs) => {
      this.activeSubscriptionsCount = subs.filter(s => s.status === 'ACTIVE').length;
      checkDone();
    }, error: () => checkDone() });

    this.deliveryService.getAllEodReports().subscribe({ next: (reports) => {
      this.recentEodReports = reports.slice(0, 3);
      checkDone();
    }, error: () => checkDone() });
  }

  confirmOrder(id: number): void {
    this.orderService.confirmOrder(id).subscribe({ next: () => {
      this.snackBar.open('Order confirmed!', 'Close', { duration: 3000 });
      this.loadData();
    }});
  }

  quickUpdateStock(product: Product): void {
    const val = prompt(`Enter new stock (kg) for "${product.name}":`);
    if (val && !isNaN(Number(val))) {
      this.productService.updateStock(product.id, Number(val)).subscribe({ next: () => {
        this.snackBar.open('Stock updated!', 'Close', { duration: 3000 });
        this.loadData();
      }});
    }
  }

  verifyEod(id: number): void {
    this.deliveryService.verifyEodReport(id).subscribe({ next: () => {
      this.snackBar.open('EOD report verified!', 'Close', { duration: 3000 });
      this.loadData();
    }});
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { PENDING: 'status-pending', CONFIRMED: 'status-confirmed', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled', REJECTED: 'status-rejected' };
    return map[status] || '';
  }
}
