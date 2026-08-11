# ZentraBank API Test Plan

## Goal
Verify that the backend works end-to-end before presenting to the team.

---

# Test Setup

## Required
- MySQL running
- Backend running on `http://localhost:5000`
- Tenant exists with `domain = localhost`
- Tenant `subscription_status = active`

Run this if needed:

```sql
UPDATE tenants SET subscription_status = 'active' WHERE id = 1;
```

---

# Test Sequence

## 1. Tenant resolution

### Request
```http
GET /api/tenants/current
```

### Expected
- Status 200
- Returns tenant name `ZentraBank`

---

## 2. Register user

### Request
```http
POST /api/auth/register
```

### Body
```json
{
  "full_name": "Ugo Onah",
  "email": "ugo@example.com",
  "phone": "08012345678",
  "password": "Password123"
}
```

### Expected
- Status 201
- User created
- Account created automatically

---

## 3. Login

### Request
```http
POST /api/auth/login
```

### Body
```json
{
  "email": "ugo@example.com",
  "password": "Password123"
}
```

### Expected
- Status 200
- Cookie named `token` is set

---

## 4. Get current user

### Request
```http
GET /api/auth/me
```

### Expected
- Status 200
- Returns user and tenant

---

## 5. Get accounts

### Request
```http
GET /api/accounts
```

### Expected
- Status 200
- Returns at least one account

---

## 6. Promote user to tenant admin

Run:

```sql
UPDATE users SET role = 'tenant_admin' WHERE id = 1;
```

Then login again.

---

## 7. Admin credit

### Request
```http
POST /api/transactions/admin-credit
```

### Body
```json
{
  "account_id": 1,
  "amount": 50000,
  "description": "Initial funding"
}
```

### Expected
- Status 201
- Account balance increases
- Transaction created
- Audit log created
- Notification created

---

## 8. Check balance

### Request
```http
GET /api/accounts/1/balance
```

### Expected
- Status 200
- Balance reflects credit

---

## 9. Transaction history

### Request
```http
GET /api/transactions?account_id=1&page=1&limit=10
```

### Expected
- Status 200
- Returns transaction list with meta pagination

---

## 10. Audit logs

### Request
```http
GET /api/audit-logs?page=1&limit=10
```

### Expected
- Status 200
- Shows `ADMIN_CREDIT` action

---

## 11. Notifications

### Request
```http
GET /api/notifications?page=1&limit=10
```

### Expected
- Status 200
- Shows account credited notification

---

## 12. Start chat conversation

### Request
```http
POST /api/chats/conversations
```

### Body
```json
{
  "subject": "Help with my account",
  "message": "Hello, I need support."
}
```

### Expected
- Status 201
- Conversation created

---

## 13. Get chat messages

### Request
```http
GET /api/chats/conversations/1/messages?page=1&limit=20
```

### Expected
- Status 200
- Shows messages

---

## 14. Subscription request

### Request
```http
POST /api/subscriptions/request
```

### Body
```json
{
  "plan_name": "Starter",
  "amount": 50,
  "currency": "USDT",
  "payment_reference": "TXN-USDT-001",
  "payment_note": "Manual USDT payment"
}
```

### Expected
- Status 201
- Subscription request created
- Audit log created

---

## 15. Admin dashboard

### Request
```http
GET /api/admin/dashboard
```

### Expected
- Status 200
- Returns users, accounts, balances, transactions, chats

---

# Negative Tests

## Invalid register request

Send register body without password.

### Expected
- Status 400
- Validation failed

## Inactive subscription

Run:

```sql
UPDATE tenants SET subscription_status = 'trial' WHERE id = 1;
```

Test:

```http
GET /api/accounts
```

### Expected
- Status 403
- Tenant subscription is not active

Reset:

```sql
UPDATE tenants SET subscription_status = 'active' WHERE id = 1;
```

## Non-admin trying admin credit

Set user to customer:

```sql
UPDATE users SET role = 'customer' WHERE id = 1;
```

Login again, then test admin credit.

### Expected
- Status 403 or error saying only admins can credit accounts
