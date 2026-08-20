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
  },

balanceSchema: {
  params: Joi.object({
    accountId: Joi.string()
      .uuid()
      .required(),
  }),

  body: Joi.object({
    balance: Joi.number()
      .min(0)
      .precision(2)
      .required(),
  }),
},

balanceAdjustmentSchema: {
  params: Joi.object({
    accountId: Joi.string()
      .uuid()
      .required(),
  }),

  body: Joi.object({
    type: Joi.string()
      .valid(
        "credit",
        "debit"
      )
      .required(),

    amount: Joi.number()
      .positive()
      .precision(2)
      .required(),

    description: Joi.string()
      .trim()
      .max(255)
      .allow("")
      .optional(),
  }).required(),
},
};




