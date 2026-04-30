const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const tenantMiddleware = require("./middleware/tenant.middleware");
const subscriptionMiddleware = require("./middleware/subscription.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const adminRoutes = require("./modules/admin/admin.routes");
const authRoutes = require("./modules/auth/auth.routes");
const auditRoutes = require("./modules/auditLogs/audit.routes");
const tenantRoutes = require("./modules/tenants/tenant.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const chatRoutes = require("./modules/chats/chat.routes");
const subscriptionRoutes = require("./modules/subscriptions/subscription.routes");
const accountRoutes = require("./modules/accounts/account.routes");
const transactionRoutes = require("./modules/transactions/transaction.routes");
const platformRoutes = require("./modules/platform/platform.routes");

const app = express();

// Core middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

app.use("/api", limiter);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ZentraBank API running",
  });
});

// Tenant resolution should happen before tenant-based routes
app.use(tenantMiddleware);

// Subscription check after tenant is resolved
app.use(subscriptionMiddleware);

// Routes
app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/platform", platformRoutes);

// Error handler should always be last
app.use(errorMiddleware);

module.exports = app;