import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule
  ],
  template: `
    <mat-toolbar class="navbar-toolbar">
      <div class="brand-container" [routerLink]="getHomeRoute()">
        <span class="brand-logo">🟡</span>
        <span class="brand-name">Laddu Kadai</span>
        <span class="brand-subtitle">Organic Sweets</span>
      </div>

      <span class="spacer"></span>

      <!-- Desktop Nav Links -->
      <nav class="nav-links desktop-only">
        @if (authService.isCustomer()) {
          <a mat-button routerLink="/customer/dashboard" routerLinkActive="active-link">Dashboard</a>
          <a mat-button routerLink="/customer/catalog" routerLinkActive="active-link">Sweets Catalog</a>
          <a mat-button routerLink="/customer/my-orders" routerLinkActive="active-link">My Orders</a>
          <a mat-button routerLink="/customer/my-subscriptions" routerLinkActive="active-link">Subscriptions</a>
          <a mat-button routerLink="/customer/my-referrals" routerLinkActive="active-link">Refer & Earn</a>
        }

        @if (authService.isOwner()) {
          <a mat-button routerLink="/owner/dashboard" routerLinkActive="active-link">Dashboard</a>
          <a mat-button routerLink="/owner/products" routerLinkActive="active-link">Products</a>
          <a mat-button routerLink="/owner/orders" routerLinkActive="active-link">Orders</a>
          <a mat-button routerLink="/owner/subscriptions" routerLinkActive="active-link">Subscriptions</a>
          <a mat-button routerLink="/owner/deliveries" routerLinkActive="active-link">Deliveries</a>
          <a mat-button routerLink="/owner/leaderboard" routerLinkActive="active-link">Leaderboard</a>
        }

        @if (authService.isDeliveryMan()) {
          <a mat-button routerLink="/delivery/dashboard" routerLinkActive="active-link">Dashboard</a>
          <a mat-button routerLink="/delivery/today" routerLinkActive="active-link">Today's Deliveries</a>
          <a mat-button routerLink="/delivery/eod" routerLinkActive="active-link">EOD Report</a>
        }
      </nav>

      <!-- User Profile Badge & Logout -->
      @if (authService.isLoggedIn()) {
        <div class="user-profile">
          <mat-chip-option [selectable]="false" class="role-chip" [ngClass]="getRoleClass()">
            {{ authService.getRole() }}
          </mat-chip-option>
          <span class="user-name">{{ authService.getCurrentUser()?.name }}</span>

          <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User account menu">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="menu-header">
              <strong>{{ authService.getCurrentUser()?.name }}</strong>
              <small>{{ authService.getCurrentUser()?.email }}</small>
            </div>
            <button mat-menu-item (click)="logout()">
              <mat-icon color="warn">logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      }

      <!-- Mobile Menu Button -->
      <button mat-icon-button class="mobile-only" [matMenuTriggerFor]="mobileMenu" aria-label="Mobile navigation menu">
        <mat-icon>menu</mat-icon>
      </button>

      <mat-menu #mobileMenu="matMenu">
        @if (authService.isCustomer()) {
          <button mat-menu-item routerLink="/customer/dashboard">Dashboard</button>
          <button mat-menu-item routerLink="/customer/catalog">Sweets Catalog</button>
          <button mat-menu-item routerLink="/customer/my-orders">My Orders</button>
          <button mat-menu-item routerLink="/customer/my-subscriptions">Subscriptions</button>
          <button mat-menu-item routerLink="/customer/my-referrals">Refer & Earn</button>
        }
        @if (authService.isOwner()) {
          <button mat-menu-item routerLink="/owner/dashboard">Dashboard</button>
          <button mat-menu-item routerLink="/owner/products">Products</button>
          <button mat-menu-item routerLink="/owner/orders">Orders</button>
          <button mat-menu-item routerLink="/owner/subscriptions">Subscriptions</button>
          <button mat-menu-item routerLink="/owner/deliveries">Deliveries</button>
          <button mat-menu-item routerLink="/owner/leaderboard">Leaderboard</button>
        }
        @if (authService.isDeliveryMan()) {
          <button mat-menu-item routerLink="/delivery/dashboard">Dashboard</button>
          <button mat-menu-item routerLink="/delivery/today">Today's Deliveries</button>
          <button mat-menu-item routerLink="/delivery/eod">EOD Report</button>
        }
        <button mat-menu-item (click)="logout()">
          <mat-icon color="warn">logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar-toolbar {
      background-color: #ffffff;
      color: #1e293b;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid #e2e8f0;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
    }
    .brand-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .brand-logo {
      font-size: 24px;
    }
    .brand-name {
      font-weight: 700;
      font-size: 20px;
      color: #312e81;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: #e0e7ff;
      color: #4338ca;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .nav-links {
      display: flex;
      gap: 8px;

      a {
        color: #475569;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.2s;

        &:hover {
          color: #4338ca;
          background: #f1f5f9;
        }
      }

      .active-link {
        color: #4338ca !important;
        background-color: #e0e7ff !important;
        font-weight: 600;
      }
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: 16px;
    }
    .user-name {
      font-weight: 500;
      font-size: 14px;
      color: #334155;
    }
    .role-chip {
      font-size: 11px;
      font-weight: 700;
      min-height: 24px;
    }
    .role-owner {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
    }
    .role-customer {
      background-color: #dcfce7 !important;
      color: #166534 !important;
    }
    .role-delivery {
      background-color: #fef3c7 !important;
      color: #92400e !important;
    }
    .menu-header {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;

      small {
        color: #64748b;
      }
    }
    @media (max-width: 840px) {
      .desktop-only {
        display: none !important;
      }
      .user-name {
        display: none;
      }
    }
    @media (min-width: 841px) {
      .mobile-only {
        display: none !important;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);

  getHomeRoute(): string {
    if (this.authService.isOwner()) return '/owner/dashboard';
    if (this.authService.isDeliveryMan()) return '/delivery/dashboard';
    return '/customer/dashboard';
  }

  getRoleClass(): string {
    const role = this.authService.getRole();
    if (role === 'OWNER') return 'role-owner';
    if (role === 'DELIVERY_MAN') return 'role-delivery';
    return 'role-customer';
  }

  logout(): void {
    this.authService.logout();
  }
}
