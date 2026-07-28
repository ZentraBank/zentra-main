const Joi =
  require("joi");

module.exports = {
  createProgram: {
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

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        countryCode:
          Joi.string()
            .uppercase()
            .length(2)
            .optional(),

        paymentRailId:
          Joi.string()
            .uuid()
            .optional(),

        settlementAccountId:
          Joi.string()
            .uuid()
            .required(),

        settlementLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        collectionClearingLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        feeLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

        accountNumberPrefix:
          Joi.string()
            .trim()
            .max(40)
            .optional(),

        accountNumberLength:
          Joi.number()
            .integer()
            .min(6)
            .max(32)
            .default(10),

        allocationMode:
          Joi.string()
            .valid(
              "sequential",
              "random",
              "external"
            )
            .default("random"),

        reconciliationMode:
          Joi.string()
            .valid(
              "exact_reference",
              "account_number",
              "payer_reference",
              "manual"
            )
            .default(
              "account_number"
            ),

        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "maintenance"
            )
            .default("active"),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  createVirtualAccount: {
    body:
      Joi.object({
        programId:
          Joi.string()
            .uuid()
            .required(),

        ownerUserId:
          Joi.string()
            .uuid()
            .optional(),

        ownerBusinessId:
          Joi.string()
            .uuid()
            .optional(),

        masterAccountId:
          Joi.string()
            .uuid()
            .required(),

        masterLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        accountName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        externalAccountNumber:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        externalAccountReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        purpose:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        expectedPayerName:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        expectedPayerReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

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

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        collectionMode:
          Joi.string()
            .valid(
              "single_use",
              "reusable",
              "open_amount",
              "fixed_amount"
            )
            .default("reusable"),

        expiryAt:
          Joi.date()
            .iso()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  listVirtualAccounts: {
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

        ownerUserId:
          Joi.string()
            .uuid()
            .optional(),

        programId:
          Joi.string()
            .uuid()
            .optional(),

        status:
          Joi.string()
            .valid(
              "pending",
              "active",
              "suspended",
              "expired",
              "closed"
            )
            .optional(),
      }),
  },

  ingestCollection: {
    body:
      Joi.object({
        programId:
          Joi.string()
            .uuid()
            .required(),

        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(180)
            .required(),

        externalReference:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        virtualAccountNumber:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        paymentReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        payerName:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        payerAccountReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        payerBankCode:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        payerReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        amount:
          Joi.number()
            .positive()
            .precision(2)
            .required(),

        feeAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .default(0),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        receivedAt:
          Joi.date()
            .iso()
            .required(),

        rawPayload:
          Joi.object()
            .unknown(true)
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  manualMatch: {
    params:
      Joi.object({
        collectionId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        virtualAccountId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  createSweepRule: {
    body:
      Joi.object({
        programId:
          Joi.string()
            .uuid()
            .optional(),

        virtualAccountId:
          Joi.string()
            .uuid()
            .optional(),

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

        sweepType:
          Joi.string()
            .valid(
              "immediate",
              "end_of_day",
              "threshold",
              "scheduled"
            )
            .required(),

        thresholdAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        retainAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .default(0),

        destinationAccountId:
          Joi.string()
            .uuid()
            .required(),

        destinationLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        frequency:
          Joi.string()
            .trim()
            .max(120)
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
      }).or(
        "programId",
        "virtualAccountId"
      ),
  },
};
