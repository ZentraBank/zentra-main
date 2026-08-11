const Joi =
  require("joi");

module.exports = {
  createRail: {
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

        railType:
          Joi.string()
            .valid(
              "internal",
              "ach",
              "rtgs",
              "instant",
              "card",
              "wire",
              "mobile_money",
              "other"
            )
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

        settlementMode:
          Joi.string()
            .valid(
              "gross",
              "net",
              "deferred_net"
            )
            .required(),

        cutoffTime:
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

        minimumAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        maximumAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        settlementLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        clearingLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        feeLedgerAccountId:
          Joi.string()
            .uuid()
            .optional(),

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

  listRails: {
    query:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "active",
              "inactive",
              "maintenance"
            )
            .optional(),

        railType:
          Joi.string()
            .valid(
              "internal",
              "ach",
              "rtgs",
              "instant",
              "card",
              "wire",
              "mobile_money",
              "other"
            )
            .optional(),
      }),
  },

  createInstruction: {
    body:
      Joi.object({
        railId:
          Joi.string()
            .uuid()
            .required(),

        sourceAccountId:
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
            .optional(),

        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(180)
            .required(),

        externalReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        direction:
          Joi.string()
            .valid(
              "outbound",
              "inbound"
            )
            .required(),

        paymentType:
          Joi.string()
            .valid(
              "credit_transfer",
              "debit_transfer",
              "refund",
              "return",
              "reversal"
            )
            .required(),

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

        debtorName:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        debtorAccountReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        debtorBankCode:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        creditorName:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        creditorAccountReference:
          Joi.string()
            .trim()
            .min(2)
            .max(255)
            .required(),

        creditorBankCode:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        narration:
          Joi.string()
            .trim()
            .max(500)
            .optional(),

        requestedExecutionDate:
          Joi.date()
            .iso()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  listInstructions: {
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

        railId:
          Joi.string()
            .uuid()
            .optional(),

        status:
          Joi.string()
            .valid(
              "created",
              "validated",
              "pending_approval",
              "queued",
              "submitted",
              "accepted",
              "rejected",
              "cleared",
              "settled",
              "returned",
              "reversed",
              "failed",
              "cancelled"
            )
            .optional(),
      }),
  },

  instructionId: {
    params:
      Joi.object({
        instructionId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  submitInstruction: {
    params:
      Joi.object({
        instructionId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "submitted",
              "accepted",
              "rejected",
              "failed"
            )
            .default("submitted"),

        externalReference:
          Joi.string()
            .trim()
            .max(255)
            .optional(),

        note:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),
      }),
  },

  markCleared: {
    params:
      Joi.object({
        instructionId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        clearingBatchId:
          Joi.string()
            .uuid()
            .optional(),

        actorType:
          Joi.string()
            .valid(
              "staff",
              "system",
              "external_network"
            )
            .default(
              "external_network"
            ),

        note:
          Joi.string()
            .trim()
            .max(1000)
            .optional(),
      }),
  },

  createClearingBatch: {
    body:
      Joi.object({
        railId:
          Joi.string()
            .uuid()
            .required(),

        clearingDate:
          Joi.date()
            .iso()
            .required(),

        direction:
          Joi.string()
            .valid(
              "outbound",
              "inbound",
              "mixed"
            )
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

  batchInstruction: {
    params:
      Joi.object({
        batchId:
          Joi.string()
            .uuid()
            .required(),

        instructionId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  calculateSettlement: {
    body:
      Joi.object({
        railId:
          Joi.string()
            .uuid()
            .required(),

        settlementDate:
          Joi.date()
            .iso()
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

  settlementBatchId: {
    params:
      Joi.object({
        settlementBatchId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },
};
