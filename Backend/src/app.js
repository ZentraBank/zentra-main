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