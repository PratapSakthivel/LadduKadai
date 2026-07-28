import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ProductService } from '../../core/services/product.service';
import { Subscription } from '../../core/models/subscription.model';
import { Product } from '../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-my-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>My Sweet Subscriptions</h1>
          <p>Set up automated recurring deliveries for your favorite laddus</p>
        </div>
        <button mat-raised-button color="primary" (click)="toggleNewForm()">
          <mat-icon>{{ showNewForm ? 'close' : 'add' }}</mat-icon>
          {{ showNewForm ? 'Close Form' : 'New Subscription' }}
        </button>
      </div>

      <!-- Inline Create Subscription Form -->
      @if (showNewForm) {
        <mat-card class="create-sub-card">
          <h2>Set Up Recurring Delivery</h2>
          <form [formGroup]="subForm" (ngSubmit)="onCreateSubscription()" class="sub-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Select Product</mat-label>
                <mat-select formControlName="productId">
                  @for (product of products; track product.id) {
                    <mat-option [value]="product.id">
                      {{ product.name }} — ₹{{ product.pricePerKg }}/kg
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Quantity per Delivery (kg)</mat-label>
                <input matInput type="number" step="0.5" min="0.5" formControlName="quantityKg" />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Delivery Frequency (in Days)</mat-label>
                <input matInput type="number" min="7" formControlName="frequencyDays" placeholder="7 (weekly), 14 (bi-weekly), 30 (monthly)" />
                <mat-hint>Minimum 7 days frequency</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>First Delivery Date</mat-label>
                <input matInput type="date" formControlName="firstDeliveryDate" [min]="minDateString" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Delivery Address</mat-label>
              <textarea matInput rows="2" formControlName="deliveryAddress" placeholder="Enter delivery address..."></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="subForm.invalid || isCreating">
              {{ isCreating ? 'Creating Subscription...' : 'Confirm Subscription' }}
            </button>
          </form>
        </mat-card>
      }

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading && subscriptions.length === 0) {
        <mat-card class="empty-card">
          <mat-icon class="empty-icon">sync</mat-icon>
          <h3>No Active Subscriptions</h3>
          <p>Never run out of sweets! Subscribe to regular deliveries every 7, 14, or 30 days.</p>
          <button mat-raised-button color="primary" (click)="showNewForm = true">Create First Subscription</button>
        </mat-card>
      }

      @if (!isLoading && subscriptions.length > 0) {
        <mat-card class="table-card">
          <div class="table-responsive">
            <table mat-table [dataSource]="subscriptions" class="full-width">
              <!-- ID -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Sub #</th>
                <td mat-cell *matCellDef="let sub">#{{ sub.id }}</td>
              </ng-container>

              <!-- Product -->
              <ng-container matColumnDef="productName">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let sub">
                  <strong>{{ sub.productName }}</strong>
                </td>
              </ng-container>

              <!-- Qty & Total -->
              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef>Qty / Amount</th>
                <td mat-cell *matCellDef="let sub">
                  {{ sub.quantityKg }} kg
                  <br />
                  <span class="amount-text">₹{{ sub.totalAmountPerDelivery }}</span> / delivery
                </td>
              </ng-container>

              <!-- Frequency -->
              <ng-container matColumnDef="frequencyDays">
                <th mat-header-cell *matHeaderCellDef>Frequency</th>
                <td mat-cell *matCellDef="let sub">Every {{ sub.frequencyDays }} days</td>
              </ng-container>

              <!-- Next Delivery -->
              <ng-container matColumnDef="nextDeliveryDate">
                <th mat-header-cell *matHeaderCellDef>Next Delivery</th>
                <td mat-cell *matCellDef="let sub">
                  <strong>{{ sub.nextDeliveryDate }}</strong>
                  @if (sub.status === 'PAUSED') {
                    <br /><small class="text-warn">Paused until {{ sub.pausedUntil }}</small>
                  }
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let sub">
                  <mat-chip-option [selectable]="false" [ngClass]="getStatusClass(sub.status)">
                    {{ sub.status }}
                  </mat-chip-option>
                </td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let sub">
                  <div class="action-buttons">
                    @if (sub.status === 'ACTIVE') {
                      <button mat-button color="accent" (click)="openPauseBox(sub.id)">
                        <mat-icon>pause</mat-icon> Pause
                      </button>
                      <button mat-button color="warn" (click)="cancelSub(sub.id)">
                        <mat-icon>cancel</mat-icon> Cancel
                      </button>
                    }
                    @if (sub.status === 'PAUSED') {
                      <button mat-button color="primary" (click)="resumeSub(sub.id)">
                        <mat-icon>play_arrow</mat-icon> Resume
                      </button>
                      <button mat-button color="warn" (click)="cancelSub(sub.id)">
                        <mat-icon>cancel</mat-icon> Cancel
                      </button>
                    }
                  </div>
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
    .create-sub-card {
      border-radius: 16px !important;
      padding: 24px 28px;
      margin-bottom: 32px;
      border: 1px solid #c7d2fe;
      background: #f8fafc !important;

      h2 {
        font-size: 18px;
        font-weight: 700;
        color: #312e81;
        margin-bottom: 20px;
      }
    }
    .sub-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .flex-1 { flex: 1; }
    .full-width { width: 100%; }

    .table-card {
      border-radius: 16px !important;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
    }
    .table-responsive { overflow-x: auto; }
    .amount-text { font-weight: 700; color: #4338ca; }
    .text-warn { color: #d97706; font-weight: 600; }
    .action-buttons { display: flex; gap: 4px; }

    .status-active { background-color: #dcfce7 !important; color: #166534 !important; }
    .status-paused { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-cancelled { background-color: #f1f5f9 !important; color: #64748b !important; }
    .status-expired { background-color: #fee2e2 !important; color: #991b1b !important; }

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
      h3 { font-size: 20px; color: #1e293b; margin-bottom: 8px; }
      p { color: #64748b; margin-bottom: 24px; }
    }
  `]
})
export class MySubscriptionsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  isCreating = false;
  showNewForm = false;
  subscriptions: Subscription[] = [];
  products: Product[] = [];
  minDateString = '';

  displayedColumns: string[] = ['id', 'productName', 'details', 'frequencyDays', 'nextDeliveryDate', 'status', 'actions'];

  subForm = this.fb.group({
    productId: [null as number | null, [Validators.required]],
    quantityKg: [1, [Validators.required, Validators.min(0.5)]],
    frequencyDays: [7, [Validators.required, Validators.min(7)]],
    firstDeliveryDate: ['', [Validators.required]],
    deliveryAddress: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDateString = tomorrow.toISOString().split('T')[0];
    this.subForm.patchValue({ firstDeliveryDate: this.minDateString });

    this.loadProducts();
    this.loadSubscriptions();
  }

  loadProducts(): void {
    this.productService.getAvailableProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.route.queryParams.subscribe(params => {
          if (params['productId']) {
            const pId = Number(params['productId']);
            if (this.products.some(p => p.id === pId)) {
              this.subForm.patchValue({ productId: pId });
              this.showNewForm = true;
            }
          }
        });
      }
    });
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  toggleNewForm(): void {
    this.showNewForm = !this.showNewForm;
  }

  onCreateSubscription(): void {
    if (this.subForm.invalid) return;

    this.isCreating = true;
    this.subscriptionService.createSubscription(this.subForm.value as any).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.showNewForm = false;
        this.snackBar.open(`Subscription #${res.id} created! Next delivery on ${res.nextDeliveryDate}`, 'Close', { duration: 4000 });
        this.loadSubscriptions();
      },
      error: (err) => {
        this.isCreating = false;
        this.snackBar.open(err.error?.message || 'Failed to create subscription', 'Dismiss', { duration: 4000 });
      }
    });
  }

  openPauseBox(id: number): void {
    const dateStr = prompt('Enter date until which you want to pause delivery (YYYY-MM-DD):');
    if (dateStr) {
      this.subscriptionService.pauseSubscription(id, dateStr).subscribe({
        next: () => {
          this.snackBar.open('Subscription paused successfully', 'Close', { duration: 3000 });
          this.loadSubscriptions();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to pause subscription', 'Dismiss', { duration: 3000 });
        }
      });
    }
  }

  resumeSub(id: number): void {
    this.subscriptionService.resumeSubscription(id).subscribe({
      next: () => {
        this.snackBar.open('Subscription resumed successfully', 'Close', { duration: 3000 });
        this.loadSubscriptions();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to resume subscription', 'Dismiss', { duration: 3000 });
      }
    });
  }

  cancelSub(id: number): void {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      this.subscriptionService.cancelSubscription(id).subscribe({
        next: () => {
          this.snackBar.open('Subscription cancelled', 'Close', { duration: 3000 });
          this.loadSubscriptions();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Failed to cancel subscription', 'Dismiss', { duration: 3000 });
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'PAUSED': return 'status-paused';
      case 'CANCELLED': return 'status-cancelled';
      case 'EXPIRED': return 'status-expired';
      default: return '';
    }
  }
}
