import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-instant-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="form-wrapper">
        <mat-card class="order-card">
          <div class="card-header">
            <span class="header-icon">⚡</span>
            <h1>Place Instant Order</h1>
            <p>Fresh organic laddus delivered straight to your home</p>
          </div>

          <app-loading-spinner [isLoading]="isLoadingProducts"></app-loading-spinner>

          @if (!isLoadingProducts) {
            <form [formGroup]="orderForm" (ngSubmit)="onSubmit()" class="order-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Sweet / Laddu</mat-label>
                <mat-select formControlName="productId" (selectionChange)="onProductChange()">
                  @for (product of products; track product.id) {
                    <mat-option [value]="product.id">
                      {{ product.name }} — ₹{{ product.pricePerKg }}/kg (Stock: {{ product.stockKg }}kg)
                    </mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>storefront</mat-icon>
                @if (orderForm.get('productId')?.hasError('required')) {
                  <mat-error>Please select a product</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Quantity (in kg)</mat-label>
                <input matInput type="number" step="0.5" min="0.5" formControlName="quantityKg" (input)="calculateTotal()" />
                <mat-icon matPrefix>scale</mat-icon>
                @if (orderForm.get('quantityKg')?.hasError('required')) {
                  <mat-error>Quantity is required</mat-error>
                }
                @if (orderForm.get('quantityKg')?.hasError('min')) {
                  <mat-error>Minimum order quantity is 0.5 kg</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Delivery Address</mat-label>
                <textarea matInput rows="3" formControlName="deliveryAddress" placeholder="Enter complete delivery address with landmark..."></textarea>
                <mat-icon matPrefix>location_on</mat-icon>
                @if (orderForm.get('deliveryAddress')?.hasError('required')) {
                  <mat-error>Delivery address is required</mat-error>
                }
              </mat-form-field>

              <!-- Live Price Breakdown -->
              <div class="price-summary-box">
                <div class="summary-row">
                  <span>Price per kg:</span>
                  <strong>₹{{ selectedProductPrice }}</strong>
                </div>
                <div class="summary-row">
                  <span>Quantity:</span>
                  <strong>{{ orderForm.get('quantityKg')?.value || 0 }} kg</strong>
                </div>
                <hr />
                <div class="summary-row total-row">
                  <span>Total Amount:</span>
                  <span class="total-price">₹{{ calculatedTotalAmount }}</span>
                </div>
              </div>

              <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="orderForm.invalid || isSubmitting">
                @if (isSubmitting) {
                  <span>Placing Order...</span>
                } @else {
                  <span>Confirm & Place Order (₹{{ calculatedTotalAmount }})</span>
                }
              </button>
            </form>
          }
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 32px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .form-wrapper {
      display: flex;
      justify-content: center;
    }
    .order-card {
      width: 100%;
      max-width: 560px;
      padding: 36px 32px;
      border-radius: 20px !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
    }
    .card-header {
      text-align: center;
      margin-bottom: 28px;

      .header-icon {
        font-size: 36px;
        display: block;
        margin-bottom: 4px;
      }
      h1 {
        font-size: 24px;
        font-weight: 700;
        color: #1e1b4b;
        margin-bottom: 4px;
      }
      p {
        color: #64748b;
        font-size: 14px;
      }
    }
    .order-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .price-summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 8px 0;

      .summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #475569;
        margin-bottom: 6px;
      }
      hr {
        border: none;
        border-top: 1px dashed #cbd5e1;
        margin: 10px 0;
      }
      .total-row {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0;

        .total-price {
          font-size: 22px;
          font-weight: 800;
          color: #4338ca;
        }
      }
    }
    .submit-btn {
      height: 50px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 10px;
      margin-top: 8px;
    }
  `]
})
export class InstantOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoadingProducts = true;
  isSubmitting = false;
  products: Product[] = [];

  selectedProductPrice = 0;
  calculatedTotalAmount = 0;

  orderForm = this.fb.group({
    productId: [null as number | null, [Validators.required]],
    quantityKg: [1, [Validators.required, Validators.min(0.5)]],
    deliveryAddress: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.productService.getAvailableProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoadingProducts = false;

        // Auto-select product if productId query param exists
        this.route.queryParams.subscribe(params => {
          if (params['productId']) {
            const pId = Number(params['productId']);
            if (this.products.some(p => p.id === pId)) {
              this.orderForm.patchValue({ productId: pId });
              this.onProductChange();
            }
          }
        });
      },
      error: () => {
        this.isLoadingProducts = false;
      }
    });
  }

  onProductChange(): void {
    const pId = this.orderForm.get('productId')?.value;
    const selected = this.products.find(p => p.id === pId);
    this.selectedProductPrice = selected ? selected.pricePerKg : 0;
    this.calculateTotal();
  }

  calculateTotal(): void {
    const qty = this.orderForm.get('quantityKg')?.value || 0;
    this.calculatedTotalAmount = Number((qty * this.selectedProductPrice).toFixed(2));
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return;

    this.isSubmitting = true;
    this.orderService.placeInstantOrder(this.orderForm.value as any).subscribe({
      next: (order) => {
        this.isSubmitting = false;
        this.snackBar.open(`Order #${order.id} placed successfully! Total: ₹${order.totalAmount}`, 'View Orders', { duration: 4000 });
        this.router.navigate(['/customer/my-orders']);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to place order. Please try again.';
        this.snackBar.open(msg, 'Dismiss', { duration: 4000 });
      }
    });
  }
}
