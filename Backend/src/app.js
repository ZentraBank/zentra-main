const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// INIT APP (this is what you're missing)
const app = express();

// Imports
const tenantMiddleware = require("./middleware/tenant.middleware");
const tenantRoutes = require("./modules/tenants/tenant.routes");
const errorMiddleware = require("./middleware/error.middleware");

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Health check (NO tenant needed here)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ZentraBank API running",
  });
});

// Apply tenant middleware AFTER health check
app.use(tenantMiddleware);

// Routes
app.use("/api/tenants", tenantRoutes);

// Error handler (MUST be last)
app.use(errorMiddleware);

// EXPORT APP
module.exports = app;