# Laddu Kadai — Reseller & Subscription Platform
## Complete Project Documentation

---

## 1. PROJECT OVERVIEW

**Project Name:** Laddu Kadai — D2C Subscription & Referral Platform
**Shop Name:** Laddu Kadai (laddukadai.com)
**Location:** Dharaburam, Tiruppur District, Tamil Nadu
**Problem Solved:** Local sweet shop with 20+ organic laddu varieties, strong loyal customers but stagnant growth due to zero digital system for subscriptions, referrals, and delivery accountability.

---

## 2. TECH STACK

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Angular                           |
| Backend     | Spring Boot                       |
| Database    | MySQL                             |
| Auth        | JWT (Role Based)                  |
| Email       | JavaMailSender (Gmail SMTP)       |
| Deployment  | Render (Backend + Frontend)       |


---

## 3. USER ROLES

| Role          | Access Level                                      |
|---------------|---------------------------------------------------|
| OWNER         | Full control — products, orders, deliveries, EOD  |
| CUSTOMER      | Subscribe, instant order, referral, cancel        |
| DELIVERY_MAN  | Daily delivery list, mark status, EOD report      |

---

## 4. ORDER TYPES

### Type 1 — Subscription Order
- Customer sets their own delivery frequency (minimum 7 days)
- System auto calculates next delivery date
- Reminder email sent 2 days before delivery
- Customer can cancel before delivery day morning
- Subscription can be paused (skips next delivery, resumes after)

### Type 2 — Instant Order
- Customer orders whenever they need
- One time delivery, no repeat
- Owner gets immediate email alert
- Same delivery flow as subscription

---

## 5. COMPLETE WORKFLOW

### Owner Flow
```
Register → Login
Add laddu varieties (name, price, stock, image)
Create delivery man account
Review incoming subscription/instant orders
Confirm or reject orders
Assign delivery man + delivery date
Receive EOD report from delivery man
Verify cash collected → mark settled
Monitor dashboard (revenue, referrals, stock alerts)
```

### Customer Flow — First Time
```
Lands on homepage (direct or via referral link)
Views all laddu varieties
Registers with name, email, phone, password
Chooses order type (Subscription or Instant)
Fills order form (variety, quantity, frequency/date, address)
Submits → status shows "Pending Confirmation"
Owner confirms → customer gets confirmation email
Delivery man assigned → delivery date set
Delivery man arrives → customer pays cash
Delivery man marks "Delivered & Paid"
Customer account becomes ACTIVE
Customer receives referral link via email
```

### Customer Flow — Every Delivery
```
2 days before → reminder email with cancel link
If cancel → owner gets alert email
If no cancel → delivery proceeds
Cash paid → delivery man marks complete
Customer sees updated order history
Referral count visible in dashboard

```

### Customer Flow — Referral

```
Customer copies referral link from dashboard/email
Shares on WhatsApp to friends
Friend clicks link → referral code auto captured in URL
Friend registers → subscribes → pays first delivery
Referral count of original customer → +1
At count = 5 → reward email sent to customer
250g free added to next delivery automatically
Counter resets to 0

```

### Delivery Man Flow — Daily

```
Login → sees today's delivery list
List shows: customer name, address, variety, quantity, amount to collect
Sorted by locality
For each delivery:
  → Mark: Delivered & Paid / Not Home / Rejected
If Not Home → auto reschedule next day, customer emailed
If Rejected → owner immediate email alert
End of day → submit EOD report
  → Total cash collected auto calculated
  → Owner gets daily summary email
If not submitted by 8PM → owner gets alert email

```

---

## 6. EMAIL TRIGGERS (ALL EMAILS)

| Trigger Event                         | Recipient       |
|---------------------------------------|-----------------|
| Customer registers                    | Customer        |
| Subscription confirmed by owner       | Customer        |
| Instant order confirmed               | Customer        |
| 2 days before delivery                | Customer        |
| Customer cancels order                | Owner           |
| Customer not home                     | Owner + Customer|
| Customer rejects delivery             | Owner           |
| Referral link activation              | Customer        |
| Referral count hits 5 (reward)        | Customer        |
| Delivery man submits EOD              | Owner           |
| Delivery man misses EOD by 8PM        | Owner           |
| New instant order placed              | Owner           |
| Variety stock going low               | Owner           |
| Subscription renewal reminder (3 days before expiry) | Customer |

---

## 7. DATABASE SCHEMA

### Users Table
 
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('OWNER','CUSTOMER','DELIVERY_MAN') NOT NULL,
  referral_code VARCHAR(20) UNIQUE,
  referral_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  stock_kg DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  order_type ENUM('SUBSCRIPTION','INSTANT') NOT NULL,
  status ENUM('PENDING','CONFIRMED','DISPATCHED','DELIVERED','CANCELLED','REJECTED') DEFAULT 'PENDING',
  delivery_date DATE,
  delivery_man_id BIGINT,
  referred_by BIGINT,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (delivery_man_id) REFERENCES users(id),
  FOREIGN KEY (referred_by) REFERENCES users(id)
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  frequency_days INT NOT NULL CHECK (frequency_days >= 7),
  next_delivery_date DATE NOT NULL,
  status ENUM('ACTIVE','PAUSED','CANCELLED','EXPIRED') DEFAULT 'ACTIVE',
  paused_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Deliveries Table
```sql
CREATE TABLE deliveries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  delivery_man_id BIGINT NOT NULL,
  status ENUM('PENDING','DELIVERED','NOT_HOME','REJECTED') DEFAULT 'PENDING',
  cash_collected DECIMAL(10,2),
  attempted_at TIMESTAMP,
  delivered_at TIMESTAMP,
  reschedule_date DATE,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (delivery_man_id) REFERENCES users(id)
);
```

### EOD Reports Table
```sql
CREATE TABLE eod_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  delivery_man_id BIGINT NOT NULL,
  report_date DATE NOT NULL,
  total_cash DECIMAL(10,2) NOT NULL,
  total_deliveries INT NOT NULL,
  total_not_home INT DEFAULT 0,
  total_rejected INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_man_id) REFERENCES users(id)
);
```

### Referrals Table
```sql
CREATE TABLE referrals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  referrer_id BIGINT NOT NULL,
  referred_id BIGINT NOT NULL,
  status ENUM('PENDING','CONFIRMED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_id) REFERENCES users(id)
);
```

### Rewards Table
```sql
CREATE TABLE rewards (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  grams INT NOT NULL DEFAULT 250,
  reason VARCHAR(255),
  applied_to_order_id BIGINT,
  status ENUM('PENDING','APPLIED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (applied_to_order_id) REFERENCES orders(id)
);
```

---

## 8. API LIST

### Auth APIs
```
POST /api/auth/register         → Register new customer
POST /api/auth/login            → Login all roles
GET  /api/auth/me               → Get current user details
```

### Product APIs
```
GET    /api/products            → Get all available products (public)
POST   /api/products            → Add product (OWNER only)
PUT    /api/products/{id}       → Update product (OWNER only)
DELETE /api/products/{id}       → Delete product (OWNER only)
PATCH  /api/products/{id}/stock → Update stock (OWNER only)
```

### Order APIs
```
POST /api/orders/instant        → Place instant order (CUSTOMER)
GET  /api/orders/my             → Get my orders (CUSTOMER)
GET  /api/orders/all            → Get all orders (OWNER)
PATCH /api/orders/{id}/confirm  → Confirm order (OWNER)
PATCH /api/orders/{id}/cancel   → Cancel order (CUSTOMER/OWNER)
```

### Subscription APIs
```
POST  /api/subscriptions              → Create subscription (CUSTOMER)
GET   /api/subscriptions/my           → My subscriptions (CUSTOMER)
PATCH /api/subscriptions/{id}/pause   → Pause subscription (CUSTOMER)
PATCH /api/subscriptions/{id}/cancel  → Cancel subscription (CUSTOMER)
GET   /api/subscriptions/all          → All subscriptions (OWNER)
```

### Delivery APIs
```
GET   /api/deliveries/today                    → Today's list (DELIVERY_MAN)
PATCH /api/deliveries/{id}/delivered           → Mark delivered (DELIVERY_MAN)
PATCH /api/deliveries/{id}/not-home            → Mark not home (DELIVERY_MAN)
PATCH /api/deliveries/{id}/rejected            → Mark rejected (DELIVERY_MAN)
POST  /api/deliveries/eod-report               → Submit EOD (DELIVERY_MAN)
GET   /api/deliveries/eod-reports              → All EOD reports (OWNER)
PATCH /api/deliveries/eod-reports/{id}/verify  → Verify EOD (OWNER)
```

### Referral APIs
```
GET  /api/referrals/my-link    → Get my referral link (CUSTOMER)
GET  /api/referrals/my-count   → Get referral count (CUSTOMER)
GET  /api/referrals/all        → All referrals (OWNER)
```

### Owner Dashboard APIs
```
GET /api/dashboard/revenue       → Total revenue stats
GET /api/dashboard/orders        → Order summary
GET /api/dashboard/top-products  → Best selling varieties
GET /api/dashboard/deliveries    → Delivery stats
GET /api/dashboard/referrals     → Referral leaderboard
GET /api/dashboard/stock-alerts  → Low stock alerts
```

---

## 9. EDGE CASES (COMPLETE LIST)

### Customer Edge Cases
| Situation | Handling |
|-----------|----------|
| Register with existing email/phone | Blocked — redirect to login |
| Cancel after delivery man left | Cancellation window closes morning of delivery day |
| Instant order + active subscription same day | Both allowed — separate orders |
| Referral friend never pays | Referral count unchanged |
| Self referral attempt | Blocked by phone number check |
| Minimum frequency below 7 days | Enforced at API level |
| Subscription expiry | Renewal reminder email 3 days before |
| Change delivery address | Owner notified via email |

### Delivery Man Edge Cases
| Situation | Handling |
|-----------|----------|
| Marks wrong delivery as paid | Owner can reverse from dashboard |
| Customer not home | Auto reschedule next day, customer emailed |
| Customer rejects | Owner alerted immediately |
| EOD not submitted by 8PM | Auto alert email to owner |
| Multiple deliveries same locality | Sorted by area in dashboard |

### Subscription Edge Cases
| Situation | Handling |
|-----------|----------|
| Variety out of stock on delivery date | Owner alerted 2 days before, customer emailed |
| Customer doesn't respond to reminder | Delivery proceeds as planned |
| Subscription paused | Next delivery skipped, resumes after pause period |
| Frequency too short (under 7 days) | Blocked at validation level |

### Referral Edge Cases
| Situation | Handling |
|-----------|----------|
| Friend already has account | Referral not counted |
| Friend cancels before first payment | Referral not counted |
| Friend referred by two people | First referral link used wins |
| Reward triggered but no upcoming delivery | Held and applied to next scheduled delivery |
| Referral count hits 5 | 250g reward email sent, counter resets to 0 |

### Stock Edge Cases
| Situation | Handling |
|-----------|----------|
| Stock hits low threshold | Owner alert email triggered |
| Stock = 0 | Product auto marked unavailable |
| Order placed when stock insufficient | Blocked at order creation |
| Price updated | Old orders unaffected, only new orders use new price |

---

## 10. BUILD PHASES

### Phase 1 — Project Setup + Auth
- Spring Boot project init
- MySQL connection (Aiven)
- JWT auth setup
- 3 role system
- Register / Login APIs
- Gmail SMTP email config
- Test email sending

### Phase 2 — Products + Instant Orders
- Product CRUD APIs (Owner).
- Product listing API (public).
- Instant order API (Customer).
- Owner gets email on new instant order.
- Stock deduction on order.

### Phase 3 — Subscription System.
- Subscription creation API.
- Frequency + next delivery date auto calculation.
- 2 day reminder email scheduler.
- Pause / Cancel logic.
- Renewal reminder at expiry.

### Phase 4 — Delivery Man System.
- Today's delivery list API.
- Mark delivered / not home / rejected.
- Auto reschedule on not home.
- Owner alert on rejection.
- EOD report submission.
- 8PM alert if EOD missing
- Owner EOD verification

### Phase 5 — Referral + Reward System
- Referral code generation on registration.
- Referral link logic.
- Count tracking on confirmed payment.
- 5 referral → reward trigger.
- 250g reward applied to next order.
- Reward email to customer.

### Phase 6 — Angular Frontend + Deploy.
- Auth pages (Login / Register)
- Customer dashboard (orders, subscriptions, referral count)
- Product catalog page
- Order / Subscribe flow
- Delivery man dashboard
- Owner dashboard (charts, alerts, EOD list)
- Deploy backend → Render
- Deploy frontend → Render Static
- Database → Aiven Free MySQL
- Full end to end testing

---

## 11. ANGULAR PAGES LIST

| Page | Role |
|------|------|
| Landing / Product Catalog | Public |
| Register / Login | All |
| Customer Dashboard | Customer |
| My Orders | Customer |
| My Subscriptions | Customer |
| Place Instant Order | Customer |
| Subscribe Form | Customer |
| My Referrals | Customer |
| Delivery Man Dashboard | Delivery Man |
| Today's Deliveries | Delivery Man |
| EOD Report Submit | Delivery Man |
| Owner Dashboard | Owner |
| Manage Products | Owner |
| All Orders | Owner |
| All Subscriptions | Owner |
| EOD Reports List | Owner |
| Stock Alerts | Owner |
| Referral Leaderboard | Owner |

---

## 12. DEPLOYMENT CHECKLIST

```
[ ] Aiven MySQL instance created
[ ] Spring Boot connected to Aiven DB
[ ] Gmail SMTP configured in application.properties
[ ] All APIs tested in Postman
[ ] Angular environment.ts pointing to Render backend URL
[ ] Backend deployed on Render Web Service
[ ] Frontend deployed on Render Static Site
[ ] Full flow tested end to end:
    [ ] Customer registers
    [ ] Subscribes
    [ ] Owner confirms
    [ ] Delivery man marks delivered
    [ ] Referral flow works
    [ ] EOD report submitted
    [ ] All emails triggering correctly
```

---

## 13. INTERVIEW STORY (MEMORIZE THIS)

> "My family runs an organic sweet shop in Dharapuram, Tamil Nadu — Laddu Kadai. We make over 20 varieties of laddus. Sales were strong but growth was stagnant because everything was manual — orders on WhatsApp, no delivery accountability, no way to reach new customers.
>
> I identified three core problems: no subscription system for loyal customers, no delivery tracking, and no referral mechanism to grow organically.
>
> I built a platform with three roles — Owner, Customer, and Delivery Man. Customers can subscribe with their own delivery frequency or place instant orders. The delivery man has a daily dashboard to mark each delivery status and submit an end-of-day cash report. The owner gets email alerts for everything — new orders, rejections, low stock, and missed EOD reports.
>
> For growth, I built a referral system where every confirmed customer gets a unique referral link. When they refer 5 friends who complete their first payment, they earn 250 grams free on their next delivery. This creates organic word-of-mouth growth with zero advertising cost.
>
> The entire system uses email for all notifications — no payment gateway complexity, cash on delivery with full accountability.
>
> Within the first month of using this system, we had predictable monthly revenue from subscriptions for the first time."
> the project is build phase by phase according to it 

---

## 14. ONE LINER FOR RESUME

**Laddu Kadai Platform** — Built a D2C subscription and referral management system for a family-owned organic sweet business using Spring Boot and Angular. Features include role-based JWT auth (Owner, Customer, Delivery Man), subscription management with auto email reminders, delivery accountability with EOD reporting, and a referral reward system driving organic customer growth.

---

*Documentation Version: 1.0*
*Project: Laddu Kadai Platform*
*Stack: Spring Boot + Angular + MySQL (Aiven) + Render*
