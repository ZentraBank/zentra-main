# ZentraBank API Documentation

## Project
**ZentraBank Backend API**  
A multi-tenant white-label wallet / financial management SaaS backend.

## Base URLs

### Local
```txt
http://localhost:5000
```

### Production
```txt
https://your-api-domain.com
```

## Required Headers

Most tenant-specific routes require:

```txt
Host: localhost
Content-Type: application/json
```

For production, the `Host` header will be the tenant domain, for example:

```txt
Host: alphabank.com
```

## Authentication

Authentication uses JWT stored in an HttpOnly cookie named:

```txt
token
```

Postman should keep the cookie automatically after login.

---

# 1. Health Check

## GET `/`

Checks if API is running.

### Response
```json
{
  "success": true,
  "message": "ZentraBank API running"
}
```

---

# 2. Tenants

## GET `/api/tenants/current`

Returns the current tenant resolved from the request domain.

### Response
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": 1,
      "name": "ZentraBank",
      "slug": "zentrabank",
      "domain": "localhost",
      "subscription_status": "active"
    }
  }
}
```

---

# 3. Auth

## POST `/api/auth/register`

Registers a user under the current tenant and automatically creates an account.

### Body
```json
{
  "full_name": "Ugo Onah",
  "email": "ugo@example.com",
  "phone": "08012345678",
  "password": "Password123"
}
```

### Response
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Ugo Onah",
      "email": "ugo@example.com",
      "phone": "08012345678",
      "role": "customer",
      "kyc_status": "not_started"
    },
    "account": {
      "account_number": "3011167387",
      "account_name": "Ugo Onah",
      "balance": 0,
      "currency": "NGN"
    }
  }
}
```

## POST `/api/auth/login`

Logs user in and sets JWT cookie.

### Body
```json
{
  "email": "ugo@example.com",
  "password": "Password123"
}
```

## GET `/api/auth/me`

Returns logged-in user and tenant.

## POST `/api/auth/logout`

Logs user out.

---

# 4. Accounts

All account routes require authentication and active tenant subscription.

## GET `/api/accounts`

Returns accounts belonging to the logged-in user.

## GET `/api/accounts/:id`

Returns account details.

## GET `/api/accounts/:id/balance`

Returns account balance.

### Response
```json
{
  "success": true,
  "data": {
    "account_id": 1,
    "account_number": "3011167387",
    "balance": "50000.00",
    "currency": "NGN",
    "status": "active"
  }
}
```

---

# 5. Transactions

## GET `/api/transactions?account_id=1&page=1&limit=10&type=credit&status=successful`

Returns paginated transactions for an account.

### Query Params
| Param | Required | Description |
|---|---:|---|
| account_id | Yes | Account ID |
| page | No | Page number |
| limit | No | Items per page |
| type | No | credit, debit, transfer |
| status | No | pending, successful, failed, reversed |

## POST `/api/transactions/admin-credit`

Admin-only. Credits a user account.

### Body
```json
{
  "account_id": 1,
  "amount": 50000,
  "description": "Initial funding"
}
```

## POST `/api/transactions/admin-debit`

Admin-only. Debits a user account.

### Body
```json
{
  "account_id": 1,
  "amount": 10000,
  "description": "Manual deduction"
}
```

## POST `/api/transactions/transfer`

Transfers funds between accounts under the same tenant.

### Body
```json
{
  "from_account_id": 1,
  "to_account_number": "3022222222",
  "amount": 5000,
  "description": "Test transfer"
}
```

## GET `/api/transactions/:id`

Returns a single transaction.

---

# 6. Audit Logs

Admin-only.

## GET `/api/audit-logs?page=1&limit=10&action=ADMIN_CREDIT&entity_type=account`

Returns audit logs for the tenant.

### Filters
| Filter | Example |
|---|---|
| action | ADMIN_CREDIT |
| entity_type | account |

---

# 7. Notifications

## GET `/api/notifications?page=1&limit=10&is_read=false&type=transaction`

Returns paginated notifications for the logged-in user.

## GET `/api/notifications/unread-count`

Returns unread count.

## PATCH `/api/notifications/:id/read`

Marks one notification as read.

## PATCH `/api/notifications/read-all`

Marks all notifications as read.

---

# 8. Chats

Chat is between tenant admins and end users.

## POST `/api/chats/conversations`

Starts a new conversation.

### Body
```json
{
  "subject": "Help with account",
  "message": "Hello, I need help with my account."
}
```

## GET `/api/chats/conversations?page=1&limit=10&status=open`

Returns conversations.  
Admins see all tenant conversations. Customers see only their own.

## GET `/api/chats/conversations/:id/messages?page=1&limit=20`

Returns messages in a conversation.

## POST `/api/chats/conversations/:id/messages`

Sends message into a conversation.

### Body
```json
{
  "message": "We are checking this for you."
}
```

## PATCH `/api/chats/conversations/:id/close`

Admin-only. Closes a conversation.

---

# 9. Subscriptions

## POST `/api/subscriptions/request`

Requests subscription approval.

### Body
```json
{
  "plan_name": "Starter",
  "amount": 50,
  "currency": "USDT",
  "payment_reference": "TXN-USDT-001",
  "payment_note": "Paid manually via USDT"
}
```

## GET `/api/subscriptions/current`

Returns current tenant subscription.

## GET `/api/subscriptions/admin/requests`

Admin-only. Returns subscription requests.

## PATCH `/api/subscriptions/admin/:id/approve`

Admin-only. Approves subscription.

## PATCH `/api/subscriptions/admin/:id/reject`

Admin-only. Rejects subscription.

---

# 10. Admin Analytics

Admin-only.

## GET `/api/admin/dashboard`

Returns dashboard stats.

### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 2,
      "total_accounts": 2,
      "total_balance": "50000.00",
      "total_transactions": 3,
      "total_transaction_volume": "70000.00",
      "open_conversations": 1
    },
    "transaction_summary": [],
    "recent_transactions": [],
    "recent_users": []
  }
}
```

---

# 11. Socket.io Events

## Client joins user room

```js
socket.emit("join_user_room", {
  tenantId: 1,
  userId: 1
});
```

## Client listens for notifications

```js
socket.on("notification:new", (notification) => {
  console.log(notification);
});
```

## Admin joins tenant admin room

```js
socket.emit("join_tenant_admin_room", {
  tenantId: 1
});
```

## Admin listens for new conversations

```js
socket.on("chat:conversation:new", (conversation) => {
  console.log(conversation);
});
```

## User/Admin joins conversation room

```js
socket.emit("join_conversation", {
  conversationId: 1
});
```

## User/Admin listens for new messages

```js
socket.on("chat:message:new", (message) => {
  console.log(message);
});
```

---

# 12. Common Error Responses

## Validation failed

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "\"password\" is required"
  ]
}
```

## Not authenticated

```json
{
  "success": false,
  "message": "Not authenticated"
}
```

## Subscription inactive

```json
{
  "success": false,
  "message": "Tenant subscription is not active"
}
```

## Permission denied

```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```
