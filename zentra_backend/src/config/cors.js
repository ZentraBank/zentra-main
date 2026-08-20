const env = require("./env");

const allowedOrigins = [
  env.frontendUrl,
  env.tenantAdminFrontendUrl,
  env.superadminFrontendUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
].filter(Boolean);

const isPrivateDevelopmentOrigin = (origin) => {
  if (!env.isDevelopment) return false;

  try {
    const url = new URL(origin);

    const allowedPorts = new Set([
      "3000",
      "3001",
      "3002",
    ]);

    if (!allowedPorts.has(url.port)) {
      return false;
    }

    const host = url.hostname;

    return (
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin) ||
      isPrivateDevelopmentOrigin(origin)
    ) {
      return callback(null, true);
    }

    const error = new Error(
      `Origin ${origin} is not allowed by CORS`
    );

    error.statusCode = 403;

    return callback(error);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Tenant-Slug",
    "X-Request-Id",
    "X-Zentra-App",
  ],

  exposedHeaders: [
    "X-Request-Id",
    "X-Total-Count",
  ],

  maxAge: 86400,
};

module.exports = corsOptions;