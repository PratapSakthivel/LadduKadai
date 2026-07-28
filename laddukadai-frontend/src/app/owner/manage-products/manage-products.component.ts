import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { Product, ProductRequest } from '../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSlideToggleModule, MatSnackBarModule, LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>Manage Products</h1>
          <p>Add, edit, or remove laddu products. Update stock levels instantly.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openProductForm()">
          <mat-icon>add</mat-icon> Add New Product
        </button>
      </div>

      <!-- Product Form -->
      @if (showForm) {
        <mat-card class="form-card">
          <h2>{{ editingProduct ? 'Edit' : 'New' }} Product</h2>
          <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="product-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-2">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Boondi Laddu" />
                @if (productForm.get('name')?.hasError('required')) {
                  <mat-error>Product name is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Price per KG (₹)</mat-label>
                <input matInput type="number" step="0.5" min="1" formControlName="pricePerKg" />
                @if (productForm.get('pricePerKg')?.hasError('required')) {
                  <mat-error>Price is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Initial Stock (kg)</mat-label>
                <input matInput type="number" step="0.5" min="0" formControlName="stockKg" />
                @if (productForm.get('stockKg')?.hasError('required')) {
                  <mat-error>Stock is required</mat-error>
                }
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Description (optional)</mat-label>
              <textarea matInput rows="2" formControlName="description"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || isSaving">
                {{ isSaving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product') }}
              </button>
              <button mat-button type="button" (click)="closeForm()">Cancel</button>
            </div>
          </form>
        </mat-card>
      }

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading) {
        <mat-card class="table-card">
          <div class="table-responsive">
            <table mat-table [dataSource]="products" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let p">#{{ p.id }}</td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Product Name</th>
                <td mat-cell *matCellDef="let p"><strong>{{ p.name }}</strong><br /><small class="text-muted">{{ p.description }}</small></td>
              </ng-container>
              <ng-container matColumnDef="pricePerKg">
                <th mat-header-cell *matHeaderCellDef>Price / kg</th>
                <td mat-cell *matCellDef="let p" class="price-cell">₹{{ p.pricePerKg }}</td>
              </ng-container>
              <ng-container matColumnDef="stockKg">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let p" [ngClass]="p.stockKg <= 2 ? 'low-stock-cell' : ''">
                  {{ p.stockKg }} kg
                </td>
              </ng-container>
              <ng-container matColumnDef="isAvailable">
                <th mat-header-cell *matHeaderCellDef>Available</th>
                <td mat-cell *matCellDef="let p">
                  <mat-icon [color]="p.isAvailable ? 'primary' : 'warn'">
                    {{ p.isAvailable ? 'check_circle' : 'cancel' }}
                  </mat-icon>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let p">
                  <div class="row-actions">
                    <button mat-icon-button color="primary" (click)="editProduct(p)" title="Edit product">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" (click)="updateStockQuick(p)" title="Update stock">
                      <mat-icon>scale</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteProduct(p.id)" title="Delete product">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" [ngClass]="row.stockKg === 0 ? 'out-of-stock-row' : ''"></tr>
            </table>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; h1 { font-size: 28px; font-weight: 700; color: #1e1b4b; } p { color: #64748b; } }
    .form-card { padding: 24px 28px; border-radius: 16px !important; margin-bottom: 28px; border: 1px solid #c7d2fe; background: #f8fafc !important; h2 { font-size: 18px; font-weight: 700; color: #312e81; margin-bottom: 20px; } }
    .product-form { display: flex; flex-direction: column; gap: 12px; }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; } .flex-2 { flex: 2; }
    .full-width { width: 100%; }
    .form-actions { display: flex; gap: 12px; }
    .table-card { border-radius: 16px !important; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; }
    .table-responsive { overflow-x: auto; }
    .price-cell { font-weight: 700; color: #4338ca; font-size: 16px; }
    .low-stock-cell { color: #dc2626; font-weight: 700; }
    .out-of-stock-row { background-color: #fff5f5 !important; }
    .row-actions { display: flex; gap: 4px; }
    .text-muted { color: #94a3b8; font-size: 12px; }
  `]
})
export class ManageProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  showForm = false;
  isSaving = false;
  editingProduct: Product | null = null;
  products: Product[] = [];
  displayedColumns: string[] = ['id', 'name', 'pricePerKg', 'stockKg', 'isAvailable', 'actions'];

  productForm = this.fb.group({
    name: ['', [Validators.required]],
    pricePerKg: [null as number | null, [Validators.required, Validators.min(1)]],
    stockKg: [null as number | null, [Validators.required, Validators.min(0)]],
    description: ['']
  });

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({ next: (data) => { this.products = data; this.isLoading = false; }, error: () => { this.isLoading = false; } });
  }

  openProductForm(): void {
    this.editingProduct = null;
    this.productForm.reset();
    this.showForm = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue({ name: product.name, pricePerKg: product.pricePerKg, stockKg: product.stockKg, description: product.description || '' });
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editingProduct = null; }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    this.isSaving = true;
    const request = this.productForm.value as ProductRequest;

    const obs = this.editingProduct
      ? this.productService.updateProduct(this.editingProduct.id, request)
      : this.productService.createProduct(request);

    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open(this.editingProduct ? 'Product updated!' : 'Product created!', 'Close', { duration: 3000 });
        this.closeForm();
        this.loadProducts();
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(err.error?.message || 'Failed to save product', 'Dismiss', { duration: 3000 });
      }
    });
  }

  updateStockQuick(product: Product): void {
    const val = prompt(`Enter new stock (kg) for "${product.name}" (current: ${product.stockKg} kg):`);
    if (val && !isNaN(Number(val))) {
      this.productService.updateStock(product.id, Number(val)).subscribe({
        next: () => { this.snackBar.open('Stock updated!', 'Close', { duration: 3000 }); this.loadProducts(); },
        error: (err) => { this.snackBar.open(err.error?.message || 'Failed to update stock', 'Dismiss', { duration: 3000 }); }
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => { this.snackBar.open('Product deleted!', 'Close', { duration: 3000 }); this.loadProducts(); },
        error: (err) => { this.snackBar.open(err.error?.message || 'Failed to delete product', 'Dismiss', { duration: 3000 }); }
      });
    }
  }
}
