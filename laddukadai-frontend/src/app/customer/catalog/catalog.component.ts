import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>Organic Sweets Catalog 🟡</h1>
          <p>Hand-rolled laddus prepared with organic ingredients & pure ghee</p>
        </div>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading && products.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">storefront</mat-icon>
          <h3>No Sweets Currently Available</h3>
          <p>Check back soon! Our master sweet makers are hand-crafting a fresh batch.</p>
        </div>
      }

      @if (!isLoading && products.length > 0) {
        <div class="catalog-grid">
          @for (product of products; track product.id) {
            <mat-card class="product-card">
              <div class="card-image-placeholder">
                <span class="laddu-icon">🟡</span>
                <mat-chip-option [selectable]="false" class="stock-chip" [ngClass]="product.stockKg > 2 ? 'in-stock' : 'low-stock'">
                  {{ product.stockKg }} kg available
                </mat-chip-option>
              </div>

              <mat-card-content class="card-body">
                <h2>{{ product.name }}</h2>
                <div class="price-tag">₹{{ product.pricePerKg }} <small>/ kg</small></div>
                <p class="description">{{ product.description || 'Delicious traditional organic sweet rolled to perfection.' }}</p>
              </mat-card-content>

              <mat-card-actions class="card-actions">
                <button mat-raised-button color="primary" class="action-btn" (click)="orderInstant(product.id)">
                  <mat-icon>flash_on</mat-icon> Order Now
                </button>
                <button mat-stroked-button color="accent" class="action-btn" (click)="subscribe(product.id)">
                  <mat-icon>sync</mat-icon> Subscribe
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
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
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 28px;
    }
    .product-card {
      border-radius: 20px !important;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1) !important;
      }
    }
    .card-image-placeholder {
      background: linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%);
      height: 160px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;

      .laddu-icon {
        font-size: 72px;
      }
      .stock-chip {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 11px;
        font-weight: 700;
      }
      .in-stock {
        background-color: #dcfce7 !important;
        color: #166534 !important;
      }
      .low-stock {
        background-color: #fee2e2 !important;
        color: #991b1b !important;
      }
    }
    .card-body {
      padding: 20px;

      h2 {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 6px;
      }
      .price-tag {
        font-size: 24px;
        font-weight: 800;
        color: #4338ca;
        margin-bottom: 12px;

        small {
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
        }
      }
      .description {
        font-size: 14px;
        color: #64748b;
        line-height: 1.5;
      }
    }
    .card-actions {
      padding: 16px 20px 20px 20px;
      display: flex;
      gap: 12px;

      .action-btn {
        flex: 1;
        height: 42px;
        border-radius: 10px;
        font-weight: 600;
      }
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #ffffff;
      border-radius: 20px;

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
      }
    }
  `]
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  isLoading = true;
  products: Product[] = [];

  ngOnInit(): void {
    this.productService.getAvailableProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  orderInstant(productId: number): void {
    this.router.navigate(['/customer/instant-order'], { queryParams: { productId } });
  }

  subscribe(productId: number): void {
    this.router.navigate(['/customer/my-subscriptions'], { queryParams: { productId } });
  }
}
