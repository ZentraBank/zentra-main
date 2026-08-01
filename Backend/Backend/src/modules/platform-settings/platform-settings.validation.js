const Joi = require("joi");

module.exports = {
  settingKey: {
    params: Joi.object({
      settingKey: Joi.string()
        .trim()
        .pattern(/^[a-z0-9_.-]+$/)
        .min(2)
        .max(180)
        .required(),
    }),
  },

  upsert: {
    params: Joi.object({
      settingKey: Joi.string()
        .trim()
        .pattern(/^[a-z0-9_.-]+$/)
        .min(2)
        .max(180)
        .required(),
    }),

    body: Joi.object({
      value: Joi.any().required(),
      isSecret: Joi.boolean().default(false),
      description: Joi.string()
        .max(5000)
        .allow("")
        .optional(),
      reason: Joi.string()
        .max(5000)
        .optional(),
    }),
  },
};
