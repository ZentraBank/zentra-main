const Joi = require("joi");

module.exports = {
  createAccountSchema: {
    body: Joi.object({
      accountName: Joi.string().trim().min(2).max(120).required(),
      accountType: Joi.string()
        .valid("wallet", "savings", "current")
        .default("wallet"),
      currency: Joi.string().trim().uppercase().length(3).default("USD")
    })
  },
  accountIdSchema: {
    params: Joi.object({
      accountId: Joi.string().uuid().required()
    })
  },
  statusSchema: {
    params: Joi.object({
      accountId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      status: Joi.string()
        .valid("active", "inactive", "frozen", "closed")
        .required()
    })
  }
};
