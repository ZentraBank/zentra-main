const Joi =
  require("joi");

module.exports = {
  createDispute: {
    body:
      Joi.object({
        accountId:
          Joi.string()
            .uuid()
            .required(),

        transactionId:
          Joi.string()
            .uuid()
            .optional(),

        disputeType:
          Joi.string()
            .valid(
              "card_transaction",
              "bank_transfer",
              "cash_withdrawal",
              "direct_debit",
              "fee",
              "loan",
              "investment",
              "other"
            )
            .required(),

        reasonCode:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        reasonDescription:
          Joi.string()
            .trim()
            .max(2000)
            .allow("")
            .optional(),

        disputedAmount:
          Joi.number()
            .positive()
            .precision(2)
            .required(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        priority:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "urgent"
            )
            .default("medium"),

        dueAt:
          Joi.date()
            .iso()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  listDisputes: {
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
              "submitted",
              "under_review",
              "awaiting_customer",
              "awaiting_merchant",
              "provisional_credit_issued",
              "chargeback_filed",
              "representment_received",
              "pre_arbitration",
              "arbitration",
              "resolved_customer",
              "resolved_merchant",
              "withdrawn",
              "closed"
            )
            .optional(),

        priority:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "urgent"
            )
            .optional(),
      }),
  },

  disputeId: {
    params:
      Joi.object({
        disputeId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  updateDispute: {
    params:
      Joi.object({
        disputeId:
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
              "under_review",
              "awaiting_customer",
              "awaiting_merchant",
              "provisional_credit_issued",
              "chargeback_filed",
              "representment_received",
              "pre_arbitration",
              "arbitration",
              "resolved_customer",
              "resolved_merchant",
              "withdrawn",
              "closed"
            )
            .optional(),

        priority:
          Joi.string()
            .valid(
              "low",
              "medium",
              "high",
              "urgent"
            )
            .optional(),

        assignedTo:
          Joi.string()
            .uuid()
            .optional(),

        liabilityParty:
          Joi.string()
            .valid(
              "unknown",
              "customer",
              "merchant",
              "bank",
              "network"
            )
            .optional(),

        resolutionSummary:
          Joi.string()
            .trim()
            .max(2000)
            .allow("")
            .optional(),
      }).min(1),
  },

  addEvidence: {
    params:
      Joi.object({
        disputeId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        evidenceType:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        title:
          Joi.string()
            .trim()
            .min(2)
            .max(220)
            .required(),

        description:
          Joi.string()
            .trim()
            .max(2000)
            .allow("")
            .optional(),

        storageKey:
          Joi.string()
            .trim()
            .min(2)
            .max(1000)
            .required(),

        mimeType:
          Joi.string()
            .trim()
            .max(180)
            .optional(),

        fileSizeBytes:
          Joi.number()
            .integer()
            .min(0)
            .optional(),

        checksumSha256:
          Joi.string()
            .hex()
            .length(64)
            .optional(),

        submitterType:
          Joi.string()
            .valid(
              "customer",
              "staff",
              "merchant",
              "network"
            )
            .default("customer"),
      }),
  },

  reviewEvidence: {
    params:
      Joi.object({
        evidenceId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "accepted",
              "rejected"
            )
            .required(),

        reviewNote:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),
      }),
  },

  createRefund: {
    params:
      Joi.object({
        disputeId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        refundType:
          Joi.string()
            .valid(
              "provisional_credit",
              "final_refund",
              "partial_refund",
              "credit_reversal"
            )
            .required(),

        amount:
          Joi.number()
            .positive()
            .precision(2)
            .required(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        customerLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        offsetLedgerAccountId:
          Joi.string()
            .uuid()
            .required(),

        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(180)
            .required(),

        reason:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),
      }),
  },

  createChargeback: {
    params:
      Joi.object({
        disputeId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        network:
          Joi.string()
            .trim()
            .max(120)
            .optional(),

        chargebackReference:
          Joi.string()
            .trim()
            .min(3)
            .max(180)
            .required(),

        stage:
          Joi.string()
            .valid(
              "first_chargeback",
              "representment",
              "pre_arbitration",
              "arbitration",
              "closed"
            )
            .default(
              "first_chargeback"
            ),

        reasonCode:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        amount:
          Joi.number()
            .positive()
            .precision(2)
            .required(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        responseDueAt:
          Joi.date()
            .iso()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }),
  },

  updateChargeback: {
    params:
      Joi.object({
        chargebackId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        stage:
          Joi.string()
            .valid(
              "first_chargeback",
              "representment",
              "pre_arbitration",
              "arbitration",
              "closed"
            )
            .optional(),

        outcome:
          Joi.string()
            .valid(
              "pending",
              "accepted",
              "rejected",
              "won",
              "lost",
              "partially_won"
            )
            .optional(),

        outcomeAmount:
          Joi.number()
            .min(0)
            .precision(2)
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),
      }).min(1),
  },
};
