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

      transactionPin: Joi.string()
  .pattern(/^\d{4}$/)
  .required(),

appliedFxRateId: Joi.string()
  .uuid()
  .optional(),

appliedFxRate: Joi.number()
  .positive()
  .precision(10)
  .optional(),

transferType: Joi.string()
  .valid("internal", "external")
  .default("internal"),
      destinationAccountName: Joi.string().trim().max(150).when("transferType", { is: "external", then: Joi.required(), otherwise: Joi.optional() }),
      destinationBankName: Joi.string().trim().max(150).when("transferType", { is: "external", then: Joi.required(), otherwise: Joi.optional() }),
      destinationBankCode: Joi.string().trim().max(50).when("transferType", { is: "external", then: Joi.required(), otherwise: Joi.optional() }),

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
    transferId: Joi.string()
      .uuid()
      .required(),
  }),

  body: Joi.object({
    /*
     * Genuine transfer metadata.
     */
    description: Joi.string()
      .trim()
      .max(255)
      .allow("")
      .optional(),

    /*
     * Tenant-controlled display/admin metadata.
     */
    transactionType: Joi.string()
      .trim()
      .max(50)
      .allow("")
      .optional(),

    displayStatus: Joi.string()
      .trim()
      .max(50)
      .allow("")
      .optional(),

    contactLabel: Joi.string()
      .trim()
      .max(50)
      .allow("")
      .optional(),

    contactName: Joi.string()
      .trim()
      .max(150)
      .allow("")
      .optional(),

    bankType: Joi.string()
      .trim()
      .max(50)
      .allow("")
      .optional(),

    displayDate: Joi.date()
      .iso()
      .allow(null)
      .optional(),

    displayTime: Joi.string()
      .pattern(
        /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      )
      .allow("", null)
      .optional(),

    fee: Joi.number()
      .min(0)
      .precision(2)
      .allow(null)
      .optional(),

    authorizationCode: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    bankAddress: Joi.string()
      .trim()
      .max(500)
      .allow("")
      .optional(),

    customerCareLine: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    customerCareCountry: Joi.string()
      .trim()
      .max(100)
      .allow("")
      .optional(),

    customerCarePhone: Joi.string()
      .trim()
      .max(50)
      .allow("")
      .optional(),
  }).min(1),
},
};