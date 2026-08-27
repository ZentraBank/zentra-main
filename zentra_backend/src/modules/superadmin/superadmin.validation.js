const Joi = require("joi");

module.exports = {
  listTenants: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1),

      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

      search: Joi.string()
        .trim()
        .max(255)
        .optional(),

      status: Joi.string()
        .valid(
          "pending",
          "active",
          "suspended",
          "terminated"
        )
        .optional(),
    }),
  },

  tenantId: {
    params: Joi.object({
      tenantId: Joi.string()
        .uuid()
        .required(),
    }),
  },

  createTenant: {
    body: Joi.object({
      code: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9_]+$/)
        .min(2)
        .max(80)
        .required(),

      name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required(),

      appName: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required(),

      logoUrl: Joi.string()
        .uri()
        .max(1000)
        .optional(),

      primaryColor: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .required(),

      planCode: Joi.string()
        .valid(
          "bronze",
          "gold",
          "diamond"
        )
        .required(),

      ownerFirstName: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .required(),

      ownerLastName: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .required(),

      ownerEmail: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(255)
        .required(),

      ownerPassword: Joi.string()
        .min(12)
        .max(128)
        .required(),
    }),
  },

  updateTenantStatus: {
    params: Joi.object({
      tenantId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid(
          "active",
          "suspended",
          "terminated"
        )
        .required(),
    }),
  },

  updateTenantFeatures: {
    params: Joi.object({
      tenantId: Joi.string()
        .uuid()
        .required(),
    }),

    body: Joi.object({
      features: Joi.object()
        .pattern(
          Joi.string()
            .min(2)
            .max(180),
          Joi.boolean()
        )
        .min(1)
        .required(),

      reason: Joi.string()
        .trim()
        .max(5000)
        .optional(),
    }),
  },

listTenantDomains: {
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),

    search: Joi.string()
      .trim()
      .max(255)
      .optional(),

    status: Joi.string()
      .valid(
        "pending",
        "verification_pending",
        "verified",
        "provisioning",
        "active",
        "failed",
        "disconnected"
      )
      .optional(),

    domainType: Joi.string()
      .valid(
        "temporary",
        "custom"
      )
      .optional(),

    tenantId: Joi.string()
      .uuid()
      .optional(),
  }),
},

tenantDomainId: {
  params: Joi.object({
    domainId: Joi.string()
      .uuid()
      .required(),
  }),
},
};