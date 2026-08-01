const Joi =
  require("joi");

module.exports = {
  createFeeDefinition: {
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

        description:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),

        eventType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        calculationType:
          Joi.string()
            .valid(
              "fixed",
              "percentage",
              "tiered"
            )
            .required(),

        fixedAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        percentageRate:
          Joi.number()
            .min(0)
            .max(100)
            .precision(6)
            .optional(),

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

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        tiers:
          Joi.array()
            .items(
              Joi.object({
                minimum:
                  Joi.number()
                    .min(0)
                    .required(),
                maximum:
                  Joi.number()
                    .min(0)
                    .allow(null)
                    .required(),
                type:
                  Joi.string()
                    .valid(
                      "fixed",
                      "percentage"
                    )
                    .required(),
                amount:
                  Joi.number()
                    .min(0)
                    .optional(),
                rate:
                  Joi.number()
                    .min(0)
                    .max(100)
                    .optional(),
              })
            )
            .optional(),

        revenueLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        taxLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

        taxRate:
          Joi.number()
            .min(0)
            .max(100)
            .precision(6)
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .default("active"),

        priority:
          Joi.number()
            .integer()
            .min(1)
            .max(10000)
            .default(100),
      }),
  },

  listFeeDefinitions: {
    query:
      Joi.object({
        eventType:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .optional(),
      }),
  },

  assessFee: {
    body:
      Joi.object({
        eventType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        sourceType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        sourceId:
          Joi.string()
            .uuid()
            .required(),

        accountId:
          Joi.string()
            .uuid()
            .required(),

        customerLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(160)
            .required(),

        reference:
          Joi.string()
            .trim()
            .min(3)
            .max(160)
            .required(),

        baseAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .required(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  assessmentId: {
    params:
      Joi.object({
        assessmentId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  waiveFee: {
    params:
      Joi.object({
        assessmentId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        reason:
          Joi.string()
            .trim()
            .min(3)
            .max(1000)
            .required(),
      }),
  },

  createInterestProduct: {
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

        description:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),

        productType:
          Joi.string()
            .valid(
              "deposit",
              "loan",
              "investment"
            )
            .required(),

        annualRate:
          Joi.number()
            .min(0)
            .max(100)
            .precision(6)
            .required(),

        calculationBasis:
          Joi.string()
            .valid(
              "daily_balance",
              "average_daily_balance",
              "simple",
              "compound"
            )
            .required(),

        dayCountConvention:
          Joi.string()
            .valid(
              "actual_365",
              "actual_360",
              "30_360"
            )
            .default("actual_365"),

        postingFrequency:
          Joi.string()
            .valid(
              "daily",
              "weekly",
              "monthly",
              "quarterly",
              "annually",
              "maturity"
            )
            .required(),

        minimumBalance:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        maximumBalance:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        expenseLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

        incomeLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

        payableLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

        receivableLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

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

  listInterestProducts: {
    query:
      Joi.object({
        productType:
          Joi.string()
            .valid(
              "deposit",
              "loan",
              "investment"
            )
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "draft"
            )
            .optional(),
      }),
  },

  accrueInterest: {
    body:
      Joi.object({
        productId:
          Joi.string()
            .uuid()
            .required(),

        sourceType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        sourceId:
          Joi.string()
            .uuid()
            .required(),

        accountId:
          Joi.string()
            .uuid()
            .optional(),

        customerLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

        accrualDate:
          Joi.date()
            .iso()
            .required(),

        periodStart:
          Joi.date()
            .iso()
            .required(),

        periodEnd:
          Joi.date()
            .iso()
            .greater(
              Joi.ref(
                "periodStart"
              )
            )
            .required(),

        principalAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .required(),

        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(160)
            .required(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  accrualId: {
    params:
      Joi.object({
        accrualId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  treasuryPosition: {
    body:
      Joi.object({
        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        positionDate:
          Joi.date()
            .iso()
            .required(),

        totalCustomerLiabilities:
          Joi.number()
            .min(0)
            .precision(2)
            .required(),

        totalCashAssets:
          Joi.number()
            .min(0)
            .precision(2)
            .required(),

        totalLoanAssets:
          Joi.number()
            .min(0)
            .precision(2)
            .required(),

        totalInvestmentLiabilities:
          Joi.number()
            .min(0)
            .precision(2)
            .required(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },
};
