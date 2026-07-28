import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CustomerDashboardComponent } from './customer/dashboard/customer-dashboard.component';
import { CatalogComponent } from './customer/catalog/catalog.component';
import { InstantOrderComponent } from './customer/instant-order/instant-order.component';
import { MyOrdersComponent } from './customer/my-orders/my-orders.component';
import { MySubscriptionsComponent } from './customer/my-subscriptions/my-subscriptions.component';
import { MyReferralsComponent } from './customer/my-referrals/my-referrals.component';
import { OwnerDashboardComponent } from './owner/dashboard/owner-dashboard.component';
import { ManageProductsComponent } from './owner/manage-products/manage-products.component';
import { AllOrdersComponent } from './owner/all-orders/all-orders.component';
import { AllSubscriptionsComponent } from './owner/all-subscriptions/all-subscriptions.component';
import { DeliveriesComponent } from './owner/deliveries/deliveries.component';
import { ReferralLeaderboardComponent } from './owner/referral-leaderboard/referral-leaderboard.component';
import { DeliveryDashboardComponent } from './delivery/dashboard/delivery-dashboard.component';
import { TodayDeliveriesComponent } from './delivery/today-deliveries/today-deliveries.component';
import { EodReportComponent } from './delivery/eod-report/eod-report.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // CUSTOMER routes
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { role: 'CUSTOMER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'catalog', component: CatalogComponent },
      { path: 'instant-order', component: InstantOrderComponent },
      { path: 'my-orders', component: MyOrdersComponent },
      { path: 'my-subscriptions', component: MySubscriptionsComponent },
      { path: 'my-referrals', component: MyReferralsComponent },
    ]
  },

  // OWNER routes
  {
    path: 'owner',
    canActivate: [authGuard, roleGuard],
    data: { role: 'OWNER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OwnerDashboardComponent },
      { path: 'products', component: ManageProductsComponent },
      { path: 'orders', component: AllOrdersComponent },
      { path: 'subscriptions', component: AllSubscriptionsComponent },
      { path: 'deliveries', component: DeliveriesComponent },
      { path: 'leaderboard', component: ReferralLeaderboardComponent },
    ]
  },

  // DELIVERY_MAN routes
  {
    path: 'delivery',
    canActivate: [authGuard, roleGuard],
    data: { role: 'DELIVERY_MAN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DeliveryDashboardComponent },
      { path: 'today', component: TodayDeliveriesComponent },
      { path: 'eod', component: EodReportComponent },
    ]
  },

  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/login' }
];
