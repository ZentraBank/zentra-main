const Joi = require("joi");

const featureSchema = Joi.object({
  featureCode: Joi.string()
    .trim()
    .min(2)
    .max(180)
    .required(),

  isEnabled: Joi.boolean().required(),

  usageLimit: Joi.number()
    .min(0)
    .allow(null)
    .optional(),

  metadata: Joi.object().allow(null).optional(),
});

module.exports = {
  listPlans: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().trim().max(255).optional(),
      status: Joi.string()
        .valid("draft", "active", "inactive", "retired")
        .optional(),
    }),
  },

  planId: {
    params: Joi.object({
      planId: Joi.string().uuid().required(),
    }),
  },

  tenantId: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),
  },

  createPlan: {
    body: Joi.object({
      code: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9_]+$/)
        .min(2)
        .max(100)
        .required(),

      name: Joi.string().trim().min(2).max(180).required(),
      description: Joi.string().max(5000).allow("").optional(),

      billingInterval: Joi.string()
        .valid("monthly", "quarterly", "annually", "custom")
        .required(),

      price: Joi.number().precision(2).min(0).required(),

      currency: Joi.string()
        .uppercase()
        .length(3)
        .required(),

      status: Joi.string()
        .valid("draft", "active", "inactive", "retired")
        .default("draft"),

      isPublic: Joi.boolean().default(false),

      features: Joi.array()
        .items(featureSchema)
        .unique("featureCode")
        .default([]),
    }),
  },

  updatePlan: {
    params: Joi.object({
      planId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      name: Joi.string().trim().min(2).max(180).optional(),
      description: Joi.string().max(5000).allow("").optional(),

      billingInterval: Joi.string()
        .valid("monthly", "quarterly", "annually", "custom")
        .optional(),

      price: Joi.number().precision(2).min(0).optional(),

      currency: Joi.string()
        .uppercase()
        .length(3)
        .optional(),

      status: Joi.string()
        .valid("draft", "active", "inactive", "retired")
        .optional(),

      isPublic: Joi.boolean().optional(),
    }).min(1),
  },

  updatePlanFeatures: {
    params: Joi.object({
      planId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      features: Joi.array()
        .items(featureSchema)
        .unique("featureCode")
        .required(),
    }),
  },

  changeTenantPlan: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      planId: Joi.string().uuid().required(),

      action: Joi.string()
        .valid("upgraded", "downgraded")
        .required(),

      reason: Joi.string().max(5000).optional(),
    }),
  },

  changeTenantStatus: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid("active", "suspended", "cancelled", "expired")
        .required(),

      action: Joi.string()
        .valid(
          "cancelled",
          "reactivated",
          "suspended",
          "expired"
        )
        .required(),

      reason: Joi.string().max(5000).optional(),
    }),
  },

  renewTenantSubscription: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      expiresAt: Joi.date().iso().required(),
      reason: Joi.string().max(5000).optional(),
    }),
  },

  upsertTenantOverride: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      customPrice: Joi.number()
        .precision(2)
        .min(0)
        .allow(null)
        .optional(),

      customCurrency: Joi.string()
        .uppercase()
        .length(3)
        .allow(null)
        .optional(),

      customBillingInterval: Joi.string()
        .valid("monthly", "quarterly", "annually", "custom")
        .allow(null)
        .optional(),

      contractStartAt: Joi.date().iso().allow(null).optional(),
      contractEndAt: Joi.date().iso().allow(null).optional(),
      notes: Joi.string().max(5000).allow("").optional(),
    }).min(1),
  },
};
