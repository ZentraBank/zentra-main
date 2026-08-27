const Joi = require("joi");

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Update current tenant profile
  |--------------------------------------------------------------------------
  */
  updateCurrentTenant: {
    body: Joi.object({
      name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .optional(),

      appName: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .optional(),

      logoUrl: Joi.string()
        .uri()
        .max(1000)
        .allow(null, "")
        .optional(),

      primaryColor: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .optional(),

      secondaryColor: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .allow(null, "")
        .optional(),

      contactEmail: Joi.string()
        .trim()
        .email()
        .max(255)
        .allow(null, "")
        .optional(),

      contactPhone: Joi.string()
        .trim()
        .max(50)
        .allow(null, "")
        .optional(),

      countryCode: Joi.string()
        .trim()
        .uppercase()
        .length(2)
        .optional(),

      defaultCurrency: Joi.string()
        .trim()
        .uppercase()
        .length(3)
        .optional(),

      timezone: Joi.string()
        .trim()
        .max(100)
        .optional(),
    })
      .min(1)
      .required(),
  },

  /*
  |--------------------------------------------------------------------------
  | Add custom domain
  |--------------------------------------------------------------------------
  */
  createDomain: {
    body: Joi.object({
      domain: Joi.string()
        .trim()
        .lowercase()
        .max(253)
        .required(),
    }).required(),
  },

  /*
  |--------------------------------------------------------------------------
  | Domain ID
  |--------------------------------------------------------------------------
  |
  | We'll need this shortly for:
  |
  | POST   /tenants/current/domains/:domainId/verify
  | PATCH  /tenants/current/domains/:domainId/primary
  | DELETE /tenants/current/domains/:domainId
  |
  */
  domainId: {
    params: Joi.object({
      domainId: Joi.string()
        .uuid()
        .required(),
    }).required(),
  },
};