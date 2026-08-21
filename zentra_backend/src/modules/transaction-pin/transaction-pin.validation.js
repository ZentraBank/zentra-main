const Joi = require("joi");

const pin = Joi.string()
  .pattern(/^\d{4}$/)
  .required();

const otp = Joi.string()
  .pattern(/^\d{6}$/)
  .required();

module.exports = {
  setup: {
    body: Joi.object({
      password: Joi.string()
        .min(8)
        .max(128)
        .required(),

      pin,
    }).required(),
  },

  change: {
    body: Joi.object({
      currentPin: pin,

      newPin: Joi.string()
        .pattern(/^\d{4}$/)
        .invalid(
          Joi.ref("currentPin")
        )
        .required(),
    }).required(),
  },

  reset: {
    body: Joi.object({
      code: otp,

      newPin: pin,
    }).required(),
  },
};