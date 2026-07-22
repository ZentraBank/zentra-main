const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(191)
    .trim()
    .lowercase()
    .required(),

  password: Joi.string()
    .min(8)
    .max(128)
    .required(),

  tenantSlug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string()
    .min(20)
    .optional(),
});

module.exports = {
  loginSchema,
  refreshSchema,
};