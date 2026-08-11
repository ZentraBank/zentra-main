const Joi =
  require("joi");

module.exports = {
  createRateSource: {
    body:
      Joi.object({
        code:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        name:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        providerType:
          Joi.string()
            .valid(
              "manual",
              "api",
              "central_bank",
              "market_data",
              "internal"
            )
            .required(),

        priority:
          Joi.number()
            .integer()
            .min(1)
            .max(10000)
            .default(100),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive"
            )
            .default("active"),

        global:
          Joi.boolean()
            .default(false),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  createRate: {
    body:
      Joi.object({
        rateSourceId:
          Joi.string()
            .uuid()
            .required(),

        baseCurrency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        quoteCurrency:
          Joi.string()
            .uppercase()
            .length(3)
            .invalid(
              Joi.ref(
                "baseCurrency"
              )
            )
            .required(),

        bidRate:
          Joi.number()
            .positive()
            .precision(10)
            .required(),

        askRate:
          Joi.number()
            .positive()
            .precision(10)
            .required(),

        midRate:
          Joi.number()
            .positive()
            .precision(10)
            .required(),

        effectiveAt:
          Joi.date()
            .iso()
            .required(),

        expiresAt:
          Joi.date()
            .iso()
            .greater(
              Joi.ref(
                "effectiveAt"
              )
            )
            .optional(),

        externalReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        global:
          Joi.boolean()
            .default(false),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  createSpreadRule: {
    body:
      Joi.object({
        code:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(120)
            .required(),

        name:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        baseCurrency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        quoteCurrency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        customerSegment:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        transactionType:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        spreadType:
          Joi.string()
            .valid(
              "basis_points",
              "percentage",
              "fixed"
            )
            .required(),

        spreadValue:
          Joi.number()
            .min(0)
            .precision(8)
            .required(),

        minimumFee:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        maximumFee:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        priority:
          Joi.number()
            .integer()
            .min(1)
            .max(10000)
            .default(100),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .default("active"),
      }),
  },

  createQuote: {
    body:
      Joi.object({
        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(180)
            .required(),

        sourceCurrency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        destinationCurrency:
          Joi.string()
            .uppercase()
            .length(3)
            .invalid(
              Joi.ref(
                "sourceCurrency"
              )
            )
            .required(),

        sourceAmount:
          Joi.number()
            .positive()
            .precision(2)
            .required(),

        customerSegment:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        transactionType:
          Joi.string()
            .trim()
            .max(120)
            .default(
              "account_conversion"
            ),

        validForSeconds:
          Joi.number()
            .integer()
            .min(5)
            .max(3600)
            .default(30),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  executeConversion: {
    params:
      Joi.object({
        quoteId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        sourceAccountId:
          Joi.string()
            .uuid()
            .required(),

        destinationAccountId:
          Joi.string()
            .uuid()
            .required(),

        sourceLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        destinationLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        fxPositionLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        feeLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),
      }),
  },
};
