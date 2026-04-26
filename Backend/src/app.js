const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const tenantMiddleware = require("./middleware/tenant.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const tenantRoutes = require("./modules/tenants/tenant.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ZentraBank API is running",
  });
});

// Apply tenant middleware before tenant-specific routes
app.use(tenantMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);

app.use(errorMiddleware);

module.exports = app;