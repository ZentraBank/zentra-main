const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const env = require("./config/env");
const corsOptions = require("./config/cors");

const {
  sendSuccess,
} = require("./utils/response");

const notFoundMiddleware = require(
  "./middleware/notFound.middleware"
);

const errorMiddleware = require(
  "./middleware/error.middleware"
);

// Routes
const authRoutes = require(
  "./modules/auth/auth.routes"
);

const accountsRoutes = require(
  "./modules/accounts/accounts.routes"
);

const tenantRoutes = require(
  "./modules/tenants/tenant.routes"
);

const transfersRoutes = require(
  "./modules/transfers/transfers.routes"
);

const subscriptionsRoutes = require(
  "./modules/subscriptions/subscriptions.routes"
);

const cardsRoutes = require(
  "./modules/cards/cards.routes"
);

const notificationsRoutes = require(
  "./modules/notifications/notifications.routes"
);
const beneficiariesRoutes = require(
  "./modules/beneficiaries/beneficiaries.routes"
);

const auditLogsRoutes = require(
  "./modules/audit-logs/auditLogs.routes"
);

const kycRoutes = require(
  "./modules/kyc/kyc.routes"
);

const donationsRoutes = require(
  "./modules/donations/donations.routes"
);

// const loansRoutes = require(
//   "./modules/loans/loans.routes"
// );

const adminDashboardRoutes = require(
  "./modules/admin-dashboard/admin-dashboard.routes"
);

const reportsRoutes = require(
  "./modules/reports/reports.routes"
);

const ledgerRoutes = require(
  "./modules/ledger/ledger.routes"
);

const reconciliationRoutes = require(
  "./modules/reconciliation/reconciliation.routes"
);

const fraudRiskRoutes = require(
  "./modules/fraud-risk/fraud-risk.routes"
);

const approvalsRoutes = require(
  "./modules/approvals/approvals.routes"
);

const treasuryRoutes = require(
  "./modules/treasury/treasury.routes"
);

const jobsRoutes = require(
  "./modules/jobs/jobs.routes"
);

const eventsRoutes = require(
  "./modules/events/events.routes"
);

const webhooksRoutes = require(
  "./modules/webhooks/webhooks.routes"
);

const complianceRoutes = require(
  "./modules/compliance/compliance.routes"
);

const disputesRoutes = require(
  "./modules/disputes/disputes.routes"
);

const paymentsRoutes = require(
  "./modules/payments/payments.routes"
);

const fxRoutes = require(
  "./modules/fx/fx.routes"
);

const recurringPaymentRoutes = require(
  "./modules/recurring-payments/recurring.routes"
);

const virtualAccountRoutes = require(
  "./modules/virtual-accounts/virtual-accounts.routes"
);

const openBankingRoutes = require(
  "./modules/open-banking/open-banking.routes"
);

const regulatoryReportingRoutes = require(
  "./modules/regulatory-reporting/regulatory.routes"
);

const privacyRoutes = require(
  "./modules/privacy/privacy.routes"
);

const resilienceRoutes = require(
  "./modules/operational-resilience/resilience.routes"
);

const thirdPartyRoutes = require(
  "./modules/third-party-risk/third-party.routes"
);

const app = express();

/*
|--------------------------------------------------------------------------
| Application settings
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");
app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| Request ID
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const requestId =
    req.get("x-request-id") ||
    crypto.randomUUID();

  req.requestId = requestId;

  res.setHeader(
    "x-request-id",
    requestId
  );

  next();
});

/*
|--------------------------------------------------------------------------
| Security and general middleware
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(cors(corsOptions));

app.options(
  "/{*any}",
  cors(corsOptions)
);

app.use(compression());
app.use(cookieParser());

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/*
|--------------------------------------------------------------------------
| Request logging
|--------------------------------------------------------------------------
*/

if (!env.isTest) {
  app.use(
    morgan(
      env.isDevelopment
        ? "dev"
        : ":remote-addr :method :url :status :response-time ms"
    )
  );
}

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return sendSuccess(res, {
    message: `${env.appName} is running`,
    data: {
      environment: env.nodeEnv,
      version: "1.0.0",
      requestId: req.requestId,
    },
  });
});

app.get("/health", (req, res) => {
  return sendSuccess(res, {
    message:
      "API health check successful",
    data: {
      status: "healthy",
      timestamp:
        new Date().toISOString(),
      uptimeSeconds:
        Math.floor(process.uptime()),
      environment: env.nodeEnv,
    },
  });
});

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
*/

app.use(
  `${env.apiPrefix}/auth`,
  authRoutes
);

app.use(
  `${env.apiPrefix}/accounts`,
  accountsRoutes
);

app.use(
  `${env.apiPrefix}/tenants`,
  tenantRoutes
);

app.use(
  `${env.apiPrefix}/transfers`,
  transfersRoutes
);

app.use(
  `${env.apiPrefix}/subscriptions`,
  subscriptionsRoutes
);

app.use(
  `${env.apiPrefix}/cards`,
  cardsRoutes
);

app.use(
  `${env.apiPrefix}/notifications`,
  notificationsRoutes
);

app.use(
  `${env.apiPrefix}/beneficiaries`,
  beneficiariesRoutes
);

app.use(
  `${env.apiPrefix}/audit-logs`,
  auditLogsRoutes
);

app.use(
  `${env.apiPrefix}/kyc`,
  kycRoutes
);

app.use(
  `${env.apiPrefix}/donations`,
  donationsRoutes
);

// app.use(
//   `${env.apiPrefix}/loans`,
//   loansRoutes
// );

app.use(
  `${env.apiPrefix}/admin/dashboard`,
  adminDashboardRoutes
);

app.use(
  `${env.apiPrefix}/reports`,
  reportsRoutes
);

app.use(
  `${env.apiPrefix}/ledger`,
  ledgerRoutes
);

app.use(
  `${env.apiPrefix}/reconciliation`,
  reconciliationRoutes
);

app.use(
  `${env.apiPrefix}/fraud-risk`,
  fraudRiskRoutes
);

app.use(
  `${env.apiPrefix}/approvals`,
  approvalsRoutes
);

app.use(
  `${env.apiPrefix}/treasury`,
  treasuryRoutes
);

app.use(
  `${env.apiPrefix}/jobs`,
  jobsRoutes
);

app.use(
  `${env.apiPrefix}/events`,
  eventsRoutes
);

app.use(
  `${env.apiPrefix}/webhooks`,
  webhooksRoutes
);

app.use(
  `${env.apiPrefix}/compliance`,
  complianceRoutes
);

app.use(
  `${env.apiPrefix}/disputes`,
  disputesRoutes
);

app.use(
  `${env.apiPrefix}/payments`,
  paymentsRoutes
);

app.use(
  `${env.apiPrefix}/fx`,
  fxRoutes
);

app.use(
  `${env.apiPrefix}/recurring-payments`,
  recurringPaymentRoutes
);

app.use(
  `${env.apiPrefix}/virtual-accounts`,
  virtualAccountRoutes
);

app.use(
  `${env.apiPrefix}/open-banking`,
  openBankingRoutes
);

app.use(
  `${env.apiPrefix}/regulatory-reporting`,
  regulatoryReportingRoutes
);

app.use(
  `${env.apiPrefix}/privacy`,
  privacyRoutes
);

app.use(
  `${env.apiPrefix}/operational-resilience`,
  resilienceRoutes
);

app.use(
  `${env.apiPrefix}/third-parties`,
  thirdPartyRoutes
);


/*
|--------------------------------------------------------------------------
| Error handling
|--------------------------------------------------------------------------
| These must always remain after every application route.
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;