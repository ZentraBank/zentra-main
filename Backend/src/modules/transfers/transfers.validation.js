const Joi = require("joi");

module.exports = {
  createTransferSchema: {
    body: Joi.object({
      sourceAccountId: Joi.string().uuid().required(),

      destinationAccountNumber: Joi.string()
        .trim()
        .pattern(/^\d{8,20}$/)
        .required(),

      amount: Joi.number()
        .positive()
        .precision(2)
        .required(),

      currency: Joi.string()
        .trim()
        .uppercase()
        .length(3)
        .default("USD"),

      description: Joi.string()
        .trim()
        .max(255)
        .allow("")
        .optional(),
    }),
  },

  transferIdSchema: {
    params: Joi.object({
      transferId: Joi.string().uuid().required(),
    }),
  },

  listTransfersSchema: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
    }),
  },

  flagTransferSchema: {
    params: Joi.object({
      transferId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      reason: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required(),

      notes: Joi.string()
        .trim()
        .max(2000)
        .allow("")
        .optional(),
    }),
  },

  reviewTransferFlagSchema: {
    params: Joi.object({
      transferId: Joi.string().uuid().required(),
      flagId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      status: Joi.string()
        .valid("cleared", "action_required")
        .required(),

      reviewNotes: Joi.string()
        .trim()
        .max(2000)
        .allow("")
        .optional(),
    }),
  },

  reverseTransferSchema: {
    params: Joi.object({
      transferId: Joi.string().uuid().required(),
    }),

    body: Joi.object({
      reason: Joi.string()
        .trim()
        .min(5)
        .max(500)
        .required(),
    }),
  },
  updateTenantTransferSchema: {
  params: Joi.object({
    transferId: Joi.string().uuid().required(),
  }),

  body: Joi.object({
    sourceAccountId: Joi.string().uuid().optional(),

    destinationAccountNumber: Joi.string()
      .trim()
      .pattern(/^\d{8,20}$/)
      .optional(),

    amount: Joi.number()
      .positive()
      .precision(2)
      .optional(),

    currency: Joi.string()
      .trim()
      .uppercase()
      .length(3)
      .optional(),

    description: Joi.string()
      .trim()
      .max(255)
      .allow("")
      .optional(),

    status: Joi.string()
      .valid(
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "reversed"
      )
      .optional(),

    authorizationCode: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    bankAddress: Joi.string()
      .trim()
      .max(255)
      .allow("")
      .optional(),
  }).min(1),
},
};