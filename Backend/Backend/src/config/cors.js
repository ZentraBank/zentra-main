const env = require("./env");

const allowedOrigins = [
  env.frontendUrl,
  env.superadminFrontendUrl,
  ...(env.isDevelopment
    ? [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.188:3000",
      ]
    : []),
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow tools such as Postman and server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
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
  ],

  exposedHeaders: [
    "X-Request-Id",
    "X-Total-Count",
  ],

  maxAge: 86400,
};

module.exports = corsOptions;