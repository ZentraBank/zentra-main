const Joi = require("joi");

module.exports = {
  login: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .max(255)
        .required(),

      password: Joi.string()
        .min(8)
        .max(128)
        .required(),

      deviceName: Joi.string()
        .trim()
        .max(255)
        .optional(),
    }),
  },

  refresh: {
    body: Joi.object({
      deviceName: Joi.string()
        .trim()
        .max(255)
        .optional(),
    }),
  },

  logout: {
    body: Joi.object({}),
  },
};