# ZentraBank Presentation Release

## 1. Database
Create a MySQL database named `zentrabank`, copy `backend/Backend/.env.example` to `.env`, and set the database credentials and fresh JWT secrets.

Run:
```bash
cd backend/Backend
npm install
npm run db:setup
```
For an existing database, also apply every SQL file in `migrations/` in filename order.

## 2. Backend
```bash
npm run dev
```
Expected health endpoint: `http://localhost:5000/health`.

## 3. Client
Copy `frontend/zentra_work/.env.example` to `.env.local`, then:
```bash
cd frontend/zentra_work
npm install
npm run build
npm run dev
```
Open `http://localhost:3000`.

## 4. Demo flow
Register two customer accounts, verify each using the development code shown by the UI, create/fund accounts using the backend bootstrap tooling, set a transaction PIN, then demonstrate an internal transfer and a simulated external transfer.

## 5. Smoke test
```bash
E2E_EMAIL='customer@example.com' E2E_PASSWORD='YourPassword123' npm run smoke:api
```
Optional variables: `E2E_API_BASE_URL`, `E2E_TENANT_SLUG`.

## Presentation limitation
`PAYMENT_MODE=simulation` means external transfers are database-only. No money is sent to a bank or payment provider.
