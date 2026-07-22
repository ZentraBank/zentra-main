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

  PORT: Joi.number().port().default(5000),

  APP_NAME: Joi.string().default("ZentraBank API"),
  API_PREFIX: Joi.string().default("/api/v1"),

  FRONTEND_URL: Joi.string().uri().required(),
  SUPERADMIN_FRONTEND_URL: Joi.string().uri().allow("").optional(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(3306),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow("").default(""),
  DB_NAME: Joi.string().required(),
  DB_CONNECTION_LIMIT: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

  COOKIE_SECURE: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(false),

  COOKIE_SAME_SITE: Joi.string()
    .valid("strict", "lax", "none")
    .default("lax"),

  DEFAULT_TENANT_SLUG: Joi.string().default("zentra-bank"),

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

  DEFAULT_TENANT_NAME: Joi.string()
    .min(2)
    .max(150)
    .required(),

  DEFAULT_TENANT_DOMAIN: Joi.string()
    .allow("")
    .optional(),

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
  nodeEnv: value.NODE_ENV,
  isDevelopment: value.NODE_ENV === "development",
  isTest: value.NODE_ENV === "test",
  isProduction: value.NODE_ENV === "production",

  port: value.PORT,
  appName: value.APP_NAME,
  apiPrefix: value.API_PREFIX,

  frontendUrl: value.FRONTEND_URL,
  superadminFrontendUrl:
    value.SUPERADMIN_FRONTEND_URL || null,

  database: {
    host: value.DB_HOST,
    port: value.DB_PORT,
    user: value.DB_USER,
    password: value.DB_PASSWORD,
    name: value.DB_NAME,
    connectionLimit: value.DB_CONNECTION_LIMIT,
  },

  jwt: {
    accessSecret: value.JWT_ACCESS_SECRET,
    refreshSecret: value.JWT_REFRESH_SECRET,
    accessExpiresIn: value.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: value.JWT_REFRESH_EXPIRES_IN,
  },

  cookies: {
    secure: value.COOKIE_SECURE,
    sameSite: value.COOKIE_SAME_SITE,
  },

  defaultTenantSlug: value.DEFAULT_TENANT_SLUG,

  seed: {
    platformAdmin: {
      firstName: value.PLATFORM_ADMIN_FIRST_NAME,
      lastName: value.PLATFORM_ADMIN_LAST_NAME,
      email: value.PLATFORM_ADMIN_EMAIL.toLowerCase(),
      password: value.PLATFORM_ADMIN_PASSWORD,
    },

    tenant: {
      name: value.DEFAULT_TENANT_NAME,
      slug: value.DEFAULT_TENANT_SLUG,
      domain: value.DEFAULT_TENANT_DOMAIN || null,
    },

    tenantAdmin: {
      firstName: value.TENANT_ADMIN_FIRST_NAME,
      lastName: value.TENANT_ADMIN_LAST_NAME,
      email: value.TENANT_ADMIN_EMAIL.toLowerCase(),
      password: value.TENANT_ADMIN_PASSWORD,
    },
  },
});

module.exports = env;