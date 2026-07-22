const tenantRoutes = require(
  "../src/modules/tenants/tenant.routes"
);



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

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req, res, next) => {
  const requestId =
    req.get("x-request-id") || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(cors(corsOptions));
app.options("/{*any}", cors(corsOptions));

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

if (!env.isTest) {
  app.use(
    morgan(
      env.isDevelopment
        ? "dev"
        : ":remote-addr :method :url :status :response-time ms"
    )
  );
}

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
    message: "API health check successful",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.nodeEnv,
    },
  });
});

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
| We will add routes here after the foundation is tested.
|
| app.use(`${env.apiPrefix}/platform`, platformRoutes);
| app.use(`${env.apiPrefix}`, tenantMiddleware);
| app.use(`${env.apiPrefix}/auth`, authRoutes);
|--------------------------------------------------------------------------
*/
const authRoutes = require(
  "./modules/auth/auth.routes"
);

app.use(
  `${env.apiPrefix}/tenants`,
  tenantRoutes
);

app.use(
  `${env.apiPrefix}/tenants`,
  tenantRoutes
);

app.use(
  `${env.apiPrefix}/auth`,
  authRoutes
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;