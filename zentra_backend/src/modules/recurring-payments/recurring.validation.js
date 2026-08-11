const Joi =
  require("joi");

module.exports = {
  createMandate: {
    body:
      Joi.object({
        mandateType:
          Joi.string()
            .valid(
              "direct_debit",
              "recurring_card",
              "standing_order",
              "wallet_autopay"
            )
            .required(),

        creditorName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        creditorReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        sourceAccountId:
          Joi.string()
            .uuid()
            .required(),

        sourceLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        destinationAccountId:
          Joi.string()
            .uuid()
            .optional(),

        destinationLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

        paymentRailId:
          Joi.string()
            .uuid()
            .optional(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        fixedAmount:
          Joi.number()
            .positive()
            .precision(2)
            .optional(),

        maximumAmount:
          Joi.number()
            .positive()
            .precision(2)
            .optional(),

        frequency:
          Joi.string()
            .valid(
              "daily",
              "weekly",
              "biweekly",
              "monthly",
              "quarterly",
              "semiannual",
              "annual",
              "custom"
            )
            .required(),

        intervalValue:
          Joi.number()
            .integer()
            .min(1)
            .max(365)
            .optional(),

        intervalUnit:
          Joi.string()
            .valid(
              "day",
              "week",
              "month"
            )
            .optional(),

        startDate:
          Joi.date()
            .iso()
            .required(),

        endDate:
          Joi.date()
            .iso()
            .greater(
              Joi.ref(
                "startDate"
              )
            )
            .optional(),

        executionTime:
          Joi.string()
            .pattern(
              /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
            )
            .optional(),

        timezone:
          Joi.string()
            .trim()
            .max(120)
            .default("UTC"),

        holidayPolicy:
          Joi.string()
            .valid(
              "previous_business_day",
              "next_business_day",
              "skip"
            )
            .default(
              "next_business_day"
            ),

        insufficientFundsPolicy:
          Joi.string()
            .valid(
              "fail",
              "retry",
              "partial_not_allowed"
            )
            .default("retry"),

        retryCount:
          Joi.number()
            .integer()
            .min(0)
            .max(20)
            .default(3),

        retryIntervalHours:
          Joi.number()
            .integer()
            .min(1)
            .max(720)
            .default(24),

        activationMethod:
          Joi.string()
            .valid(
              "customer_authorisation",
              "staff_approval",
              "external_confirmation"
            )
            .default(
              "customer_authorisation"
            ),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  listMandates: {
    query:
      Joi.object({
        page:
          Joi.number()
            .integer()
            .min(1)
            .default(1),

        pageSize:
          Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(20),

        userId:
          Joi.string()
            .uuid()
            .optional(),

        status:
          Joi.string()
            .valid(
              "pending_activation",
              "active",
              "paused",
              "cancelled",
              "expired",
              "completed",
              "failed"
            )
            .optional(),

        mandateType:
          Joi.string()
            .valid(
              "direct_debit",
              "recurring_card",
              "standing_order",
              "wallet_autopay"
            )
            .optional(),
      }),
  },

  createAuthorisation: {
    params:
      Joi.object({
        mandateId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        authorisationType:
          Joi.string()
            .valid(
              "otp",
              "signed_document",
              "bank_confirmation",
              "staff_approval",
              "api_consent"
            )
            .required(),

        authorisationReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        evidenceStorageKey:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  confirmAuthorisation: {
    params:
      Joi.object({
        authorisationId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  changeMandateStatus: {
    params:
      Joi.object({
        mandateId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "active",
              "paused",
              "cancelled"
            )
            .required(),

        actorType:
          Joi.string()
            .valid(
              "customer",
              "staff",
              "system",
              "external_party"
            )
            .default("customer"),

        reason:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),
      }),
  },

  executeDueSchedules: {
    body:
      Joi.object({
        limit:
          Joi.number()
            .integer()
            .min(1)
            .max(1000)
            .default(100),
      }),
  },
};
