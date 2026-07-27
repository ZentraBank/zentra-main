const Joi = require("joi");

const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required(),

    password: Joi.string()
      .min(8)
      .max(128)
      .required(),
  }),
};

const refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string()
      .min(32)
      .optional(),
  }),
};

const logoutSchema = {
  body: Joi.object({
    refreshToken: Joi.string()
      .min(32)
      .optional(),
  }),
};

module.exports = {
  loginSchema,
  refreshSchema,
  logoutSchema,
};