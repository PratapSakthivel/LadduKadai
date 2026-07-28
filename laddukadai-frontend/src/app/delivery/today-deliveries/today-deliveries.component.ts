import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeliveryService } from '../../core/services/delivery.service';
import { Delivery } from '../../core/models/delivery.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-today-deliveries',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, LoadingSpinnerComponent
  ],
  template: `
    <div class="page-container">
      <div class="header-section">
        <div>
          <h1>Today's Deliveries 🛵</h1>
          <p>Mark each delivery outcome — delivered, not home, or rejected</p>
        </div>
        <div class="cash-summary">
          <mat-icon color="primary">payments</mat-icon>
          <span>Cash Collected Today: <strong>₹{{ totalCashCollected }}</strong></span>
        </div>
      </div>

      <app-loading-spinner [isLoading]="isLoading"></app-loading-spinner>

      @if (!isLoading && deliveries.length === 0) {
        <mat-card class="empty-card">
          <mat-icon class="empty-icon">done_all</mat-icon>
          <h3>No Deliveries Today</h3>
          <p>You have no deliveries scheduled for today. Check back tomorrow!</p>
        </mat-card>
      }

      <div class="delivery-cards-grid">
        @for (delivery of deliveries; track delivery.id) {
          <mat-card class="delivery-card" [ngClass]="getCardClass(delivery.status)">
            <div class="card-top">
              <div class="customer-info">
                <h3>{{ delivery.customerName }}</h3>
                <a [href]="'tel:' + delivery.customerPhone" class="phone-link">
                  <mat-icon>phone</mat-icon> {{ delivery.customerPhone }}
                </a>
              </div>
              <mat-chip-option [selectable]="false" [ngClass]="getStatusClass(delivery.status)">
                {{ delivery.status }}
              </mat-chip-option>
            </div>

            <div class="product-info">
              <span class="product-name">🟡 {{ delivery.productName }}</span>
              <span class="qty">{{ delivery.quantityKg }} kg</span>
            </div>

            <div class="amount-box">
              <span class="amount-label">AMOUNT TO COLLECT</span>
              <span class="amount-value">₹{{ delivery.amountToCollect }}</span>
            </div>

            <div class="address-box">
              <mat-icon>location_on</mat-icon>
              <span>{{ delivery.customerAddress }}</span>
            </div>

            @if (delivery.status === 'PENDING') {
              <!-- Action Buttons -->
              <div class="action-buttons">
                @if (activeDeliveryId !== delivery.id) {
                  <button mat-raised-button color="primary" (click)="openAction(delivery.id, 'delivered')">
                    ✅ Delivered
                  </button>
                  <button mat-raised-button color="accent" (click)="openAction(delivery.id, 'not-home')">
                    🏠 Not Home
                  </button>
                  <button mat-raised-button color="warn" (click)="openAction(delivery.id, 'rejected')">
                    ❌ Rejected
                  </button>
                }
              </div>

              <!-- Inline Action Forms -->
              @if (activeDeliveryId === delivery.id && activeAction === 'delivered') {
                <div class="inline-form">
                  <h4>Mark as Delivered</h4>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Cash Collected (₹)</mat-label>
                    <input matInput type="number" [formControl]="cashForm" placeholder="Enter amount collected" />
                  </mat-form-field>
                  <div class="form-row-btns">
                    <button mat-raised-button color="primary" [disabled]="cashForm.invalid || isSubmitting" (click)="markDelivered(delivery.id)">
                      Confirm Delivered
                    </button>
                    <button mat-button (click)="closeAction()">Cancel</button>
                  </div>
                </div>
              }

              @if (activeDeliveryId === delivery.id && activeAction === 'not-home') {
                <div class="inline-form">
                  <h4>Reschedule — Not Home</h4>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Reschedule Date</mat-label>
                    <input matInput type="date" [formControl]="dateForm" [min]="minDate" />
                  </mat-form-field>
                  <div class="form-row-btns">
                    <button mat-raised-button color="accent" [disabled]="dateForm.invalid || isSubmitting" (click)="markNotHome(delivery.id)">
                      Confirm Reschedule
                    </button>
                    <button mat-button (click)="closeAction()">Cancel</button>
                  </div>
                </div>
              }

              @if (activeDeliveryId === delivery.id && activeAction === 'rejected') {
                <div class="inline-form">
                  <h4>Mark as Rejected</h4>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Reason for Rejection</mat-label>
                    <textarea matInput rows="2" [formControl]="notesForm"></textarea>
                  </mat-form-field>
                  <div class="form-row-btns">
                    <button mat-raised-button color="warn" [disabled]="notesForm.invalid || isSubmitting" (click)="markRejected(delivery.id)">
                      Confirm Rejected
                    </button>
                    <button mat-button (click)="closeAction()">Cancel</button>
                  </div>
                </div>
              }
            }

            @if (delivery.status === 'DELIVERED') {
              <div class="delivered-info">
                <mat-icon color="primary">check_circle</mat-icon>
                <span>Delivered — ₹{{ delivery.amountToCollect }} collected</span>
              </div>
            }
            @if (delivery.status === 'NOT_HOME') {
              <div class="not-home-info">
                <mat-icon color="accent">home</mat-icon>
                <span>Not Home — Rescheduled to {{ delivery.rescheduleDate }}</span>
              </div>
            }
            @if (delivery.status === 'REJECTED') {
              <div class="rejected-info">
                <mat-icon color="warn">cancel</mat-icon>
                <span>Rejected — {{ delivery.notes }}</span>
              </div>
            }
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 24px; max-width: 1100px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; h1 { font-size: 28px; font-weight: 700; color: #1e1b4b; } p { color: #64748b; } }
    .cash-summary { display: flex; align-items: center; gap: 8px; background: #f0fdf4; padding: 12px 20px; border-radius: 12px; border: 1px solid #bbf7d0; font-size: 15px; strong { color: #15803d; font-size: 18px; } }
    .delivery-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
    .delivery-card { border-radius: 20px !important; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; display: flex; flex-direction: column; gap: 14px; }
    .card-pending { border-left: 5px solid #4338ca; }
    .card-delivered { border-left: 5px solid #10b981; background: #f0fdf4 !important; }
    .card-not-home { border-left: 5px solid #f59e0b; background: #fffbeb !important; }
    .card-rejected { border-left: 5px solid #ef4444; background: #fff5f5 !important; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .customer-info { h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; } }
    .phone-link { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #4338ca; text-decoration: none; mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .product-info { display: flex; justify-content: space-between; background: #f8fafc; padding: 10px 14px; border-radius: 10px; font-size: 14px; .product-name { font-weight: 600; } .qty { font-weight: 700; color: #4338ca; } }
    .amount-box { text-align: center; padding: 14px; background: linear-gradient(135deg, #312e81, #4338ca); border-radius: 12px; .amount-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #a5b4fc; margin-bottom: 4px; } .amount-value { font-size: 28px; font-weight: 900; color: #ffffff; } }
    .address-box { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #475569; mat-icon { font-size: 16px; width: 16px; height: 16px; color: #94a3b8; flex-shrink: 0; margin-top: 2px; } }
    .action-buttons { display: flex; gap: 8px; flex-wrap: wrap; button { flex: 1; min-width: 100px; font-weight: 600; border-radius: 10px; } }
    .inline-form { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; h4 { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 12px; } }
    .full-width { width: 100%; }
    .form-row-btns { display: flex; gap: 8px; margin-top: 8px; }
    .delivered-info, .not-home-info, .rejected-info { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.7); }
    .delivered-info { color: #166534; } .not-home-info { color: #92400e; } .rejected-info { color: #991b1b; }
    .empty-card { text-align: center; padding: 60px 20px; border-radius: 16px !important; .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #94a3b8; margin-bottom: 16px; } h3 { font-size: 20px; color: #1e293b; } p { color: #64748b; } }
    .status-pending { background-color: #e0e7ff !important; color: #3730a3 !important; }
    .status-delivered { background-color: #dcfce7 !important; color: #166534 !important; }
    .status-not-home { background-color: #fef3c7 !important; color: #92400e !important; }
    .status-rejected { background-color: #fee2e2 !important; color: #991b1b !important; }
  `]
})
export class TodayDeliveriesComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  isSubmitting = false;
  deliveries: Delivery[] = [];
  totalCashCollected = 0;
  activeDeliveryId: number | null = null;
  activeAction: 'delivered' | 'not-home' | 'rejected' | null = null;
  minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  cashForm = this.fb.control(null, [Validators.required, Validators.min(0)]);
  dateForm = this.fb.control('', [Validators.required]);
  notesForm = this.fb.control('', [Validators.required]);

  ngOnInit(): void { this.loadDeliveries(); }

  loadDeliveries(): void {
    this.isLoading = true;
    this.deliveryService.getTodayDeliveries().subscribe({
      next: (data) => {
        this.deliveries = [...data].sort((a, b) => a.customerAddress.localeCompare(b.customerAddress));
        this.totalCashCollected = data.filter(d => d.status === 'DELIVERED').reduce((sum, d) => sum + (d.amountToCollect || 0), 0);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  openAction(id: number, action: 'delivered' | 'not-home' | 'rejected'): void {
    this.activeDeliveryId = id;
    this.activeAction = action;
    this.cashForm.reset();
    this.dateForm.reset('');
    this.notesForm.reset('');
  }

  closeAction(): void { this.activeDeliveryId = null; this.activeAction = null; }

  markDelivered(id: number): void {
    if (this.cashForm.invalid) return;
    this.isSubmitting = true;
    this.deliveryService.markDelivered(id, { cashCollected: this.cashForm.value ?? 0 }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAction();
        this.snackBar.open('Marked as Delivered!', 'Close', { duration: 3000 });
        this.loadDeliveries();
      },
      error: (err) => { this.isSubmitting = false; this.snackBar.open(err.error?.message || 'Error', 'Dismiss', { duration: 3000 }); }
    });
  }

  markNotHome(id: number): void {
    if (this.dateForm.invalid) return;
    this.isSubmitting = true;
    this.deliveryService.markNotHome(id, { rescheduleDate: this.dateForm.value as string }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAction();
        this.snackBar.open('Rescheduled!', 'Close', { duration: 3000 });
        this.loadDeliveries();
      },
      error: (err) => { this.isSubmitting = false; this.snackBar.open(err.error?.message || 'Error', 'Dismiss', { duration: 3000 }); }
    });
  }

  markRejected(id: number): void {
    if (this.notesForm.invalid) return;
    this.isSubmitting = true;
    this.deliveryService.markRejected(id, { notes: this.notesForm.value as string }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAction();
        this.snackBar.open('Marked as Rejected', 'Close', { duration: 3000 });
        this.loadDeliveries();
      },
      error: (err) => { this.isSubmitting = false; this.snackBar.open(err.error?.message || 'Error', 'Dismiss', { duration: 3000 }); }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { PENDING: 'status-pending', DELIVERED: 'status-delivered', NOT_HOME: 'status-not-home', REJECTED: 'status-rejected' };
    return map[status] || '';
  }

  getCardClass(status: string): string {
    const map: Record<string, string> = { PENDING: 'card-pending', DELIVERED: 'card-delivered', NOT_HOME: 'card-not-home', REJECTED: 'card-rejected' };
    return map[status] || '';
  }
}
