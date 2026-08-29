const path = require("path");
const dotenv = require("dotenv");
const Joi = require("joi");

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),

  PORT: Joi.number()
    .port()
    .default(5000),

  APP_NAME: Joi.string()
    .default("ZentraBank API"),

  API_PREFIX: Joi.string()
    .default("/api/v1"),

  /*
  |--------------------------------------------------------------------------
  | Frontend origins
  |--------------------------------------------------------------------------
  */

  FRONTEND_URL: Joi.string()
    .uri()
    .required(),

  TENANT_ADMIN_FRONTEND_URL: Joi.string()
    .uri()
    .allow("")
    .optional(),

  SUPERADMIN_FRONTEND_URL: Joi.string()
    .uri()
    .allow("")
    .optional(),

  TENANT_TEMPORARY_DOMAIN: Joi.string()
    .hostname()
    .default("zentrabank.app"),

  /*
  |--------------------------------------------------------------------------
  | Database
  |--------------------------------------------------------------------------
  */

  DB_HOST: Joi.string()
    .required(),

  DB_PORT: Joi.number()
    .port()
    .default(3306),

  DB_USER: Joi.string()
    .required(),

  DB_PASSWORD: Joi.string()
    .allow("")
    .default(""),

  DB_NAME: Joi.string()
    .required(),

  DB_CONNECTION_LIMIT: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  /*
  |--------------------------------------------------------------------------
  | JWT
  |--------------------------------------------------------------------------
  */

  JWT_ACCESS_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_ACCESS_EXPIRES_IN: Joi.string()
    .default("15m"),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default("7d"),

  /*
  |--------------------------------------------------------------------------
  | Cookies
  |--------------------------------------------------------------------------
  */

  COOKIE_SECURE: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(false),

  COOKIE_SAME_SITE: Joi.string()
    .valid("strict", "lax", "none")
    .default("lax"),

  /*
  |--------------------------------------------------------------------------
  | Email / SMTP
  |--------------------------------------------------------------------------
  */

  SMTP_HOST: Joi.string()
    .hostname()
    .required(),

  SMTP_PORT: Joi.number()
    .port()
    .default(465),

  SMTP_SECURE: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(true),

  SMTP_USER: Joi.string()
    .trim()
    .required(),

  SMTP_PASSWORD: Joi.string()
    .required(),

  EMAIL_FROM_NAME: Joi.string()
    .trim()
    .default("ZentraBank"),

  EMAIL_FROM_ADDRESS: Joi.string()
    .email()
    .required(),

  /*
  |--------------------------------------------------------------------------
  | Default tenant
  |--------------------------------------------------------------------------
  */

  DEFAULT_TENANT_NAME: Joi.string()
    .min(2)
    .max(150)
    .required(),

  DEFAULT_TENANT_SLUG: Joi.string()
    .default("zentrabank"),

  DEFAULT_TENANT_DOMAIN: Joi.string()
    .allow("")
    .optional(),

  /*
  |--------------------------------------------------------------------------
  | Social authentication
  |--------------------------------------------------------------------------
  */

  GOOGLE_CLIENT_ID: Joi.string()
    .allow("")
    .optional(),

  GOOGLE_CLIENT_SECRET: Joi.string()
    .allow("")
    .optional(),

  FACEBOOK_APP_ID: Joi.string()
    .allow("")
    .optional(),

  FACEBOOK_APP_SECRET: Joi.string()
    .allow("")
    .optional(),

  FACEBOOK_API_VERSION: Joi.string()
    .default("v25.0"),

  /*
  |--------------------------------------------------------------------------
  | Cloudflare
  |--------------------------------------------------------------------------
  */

  CLOUDFLARE_API_TOKEN: Joi.string()
    .allow("")
    .optional(),

  CLOUDFLARE_ZONE_ID: Joi.string()
    .allow("")
    .optional(),

  CLOUDFLARE_FALLBACK_ORIGIN: Joi.string()
    .hostname()
    .allow("")
    .optional(),

  /*
  |--------------------------------------------------------------------------
  | Platform administrator seed
  |--------------------------------------------------------------------------
  */

  PLATFORM_ADMIN_FIRST_NAME: Joi.string()
    .min(2)
    .max(100)
    .required(),

  PLATFORM_ADMIN_LAST_NAME: Joi.string()
    .min(2)
    .max(100)
    .required(),

  PLATFORM_ADMIN_EMAIL: Joi.string()
    .email()
    .required(),

  PLATFORM_ADMIN_PASSWORD: Joi.string()
    .min(8)
    .required(),

  /*
  |--------------------------------------------------------------------------
  | Tenant administrator seed
  |--------------------------------------------------------------------------
  */

  TENANT_ADMIN_FIRST_NAME: Joi.string()
    .min(2)
    .max(100)
    .required(),

  TENANT_ADMIN_LAST_NAME: Joi.string()
    .min(2)
    .max(100)
    .required(),

  TENANT_ADMIN_EMAIL: Joi.string()
    .email()
    .required(),

  TENANT_ADMIN_PASSWORD: Joi.string()
    .min(8)
    .required(),
})
  .unknown(true)
  .required();

const { value, error } = environmentSchema.validate(
  process.env,
  {
    abortEarly: false,
    convert: true,
  }
);

if (error) {
  const details = error.details
    .map((detail) => detail.message)
    .join(", ");

  throw new Error(
    `Environment validation failed: ${details}`
  );
}

const env = Object.freeze({
  /*
  |--------------------------------------------------------------------------
  | Application
  |--------------------------------------------------------------------------
  */

  nodeEnv:
    value.NODE_ENV,

  isDevelopment:
    value.NODE_ENV === "development",

  isTest:
    value.NODE_ENV === "test",

  isProduction:
    value.NODE_ENV === "production",

  port:
    value.PORT,

  appName:
    value.APP_NAME,

  apiPrefix:
    value.API_PREFIX,

  /*
  |--------------------------------------------------------------------------
  | Frontend applications
  |--------------------------------------------------------------------------
  */

  frontendUrl:
    value.FRONTEND_URL,

  tenantAdminFrontendUrl:
    value.TENANT_ADMIN_FRONTEND_URL || null,

  superadminFrontendUrl:
    value.SUPERADMIN_FRONTEND_URL || null,

  tenantTemporaryDomain:
    value.TENANT_TEMPORARY_DOMAIN,

  /*
  |--------------------------------------------------------------------------
  | Database
  |--------------------------------------------------------------------------
  */

  database: {
    host:
      value.DB_HOST,

    port:
      value.DB_PORT,

    user:
      value.DB_USER,

    password:
      value.DB_PASSWORD,

    name:
      value.DB_NAME,

    connectionLimit:
      value.DB_CONNECTION_LIMIT,
  },

  /*
  |--------------------------------------------------------------------------
  | JWT
  |--------------------------------------------------------------------------
  */

  jwt: {
    accessSecret:
      value.JWT_ACCESS_SECRET,

    refreshSecret:
      value.JWT_REFRESH_SECRET,

    accessExpiresIn:
      value.JWT_ACCESS_EXPIRES_IN,

    refreshExpiresIn:
      value.JWT_REFRESH_EXPIRES_IN,
  },

  /*
  |--------------------------------------------------------------------------
  | Cookies
  |--------------------------------------------------------------------------
  */

  cookies: {
    secure:
      value.COOKIE_SECURE,

    sameSite:
      value.COOKIE_SAME_SITE,
  },

  /*
  |--------------------------------------------------------------------------
  | Email / SMTP
  |--------------------------------------------------------------------------
  */

  email: {
    smtp: {
      host:
        value.SMTP_HOST,

      port:
        value.SMTP_PORT,

      secure:
        value.SMTP_SECURE,

      user:
        value.SMTP_USER,

      password:
        value.SMTP_PASSWORD,
    },

    from: {
      name:
        value.EMAIL_FROM_NAME,

      address:
        value.EMAIL_FROM_ADDRESS,
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Default tenant
  |--------------------------------------------------------------------------
  */

  defaultTenantSlug:
    value.DEFAULT_TENANT_SLUG,

  /*
  |--------------------------------------------------------------------------
  | Social authentication
  |--------------------------------------------------------------------------
  */

  socialAuth: {
    google: {
      clientId:
        value.GOOGLE_CLIENT_ID || null,

      clientSecret:
        value.GOOGLE_CLIENT_SECRET || null,
    },

    facebook: {
      clientId:
        value.FACEBOOK_APP_ID || null,

      clientSecret:
        value.FACEBOOK_APP_SECRET || null,

      apiVersion:
        value.FACEBOOK_API_VERSION,
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Cloudflare
  |--------------------------------------------------------------------------
  */

  cloudflare: {
    apiToken:
      value.CLOUDFLARE_API_TOKEN || null,

    zoneId:
      value.CLOUDFLARE_ZONE_ID || null,

    fallbackOrigin:
      value.CLOUDFLARE_FALLBACK_ORIGIN || null,
  },

  /*
  |--------------------------------------------------------------------------
  | Seed configuration
  |--------------------------------------------------------------------------
  */

  seed: {
    platformAdmin: {
      firstName:
        value.PLATFORM_ADMIN_FIRST_NAME,

      lastName:
        value.PLATFORM_ADMIN_LAST_NAME,

      email:
        value.PLATFORM_ADMIN_EMAIL.toLowerCase(),

      password:
        value.PLATFORM_ADMIN_PASSWORD,
    },

    tenant: {
      name:
        value.DEFAULT_TENANT_NAME,

      slug:
        value.DEFAULT_TENANT_SLUG,

      domain:
        value.DEFAULT_TENANT_DOMAIN || null,
    },

    tenantAdmin: {
      firstName:
        value.TENANT_ADMIN_FIRST_NAME,

      lastName:
        value.TENANT_ADMIN_LAST_NAME,

      email:
        value.TENANT_ADMIN_EMAIL.toLowerCase(),

      password:
        value.TENANT_ADMIN_PASSWORD,
    },
  },
});

module.exports = env;