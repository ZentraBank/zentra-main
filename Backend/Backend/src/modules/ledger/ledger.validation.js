const Joi =
  require("joi");

module.exports = {
  createLedgerAccount: {
    body:
      Joi.object({
        ownerType:
          Joi.string()
            .valid(
              "customer_account",
              "tenant",
              "system"
            )
            .required(),

        ownerId:
          Joi.string()
            .uuid()
            .allow(null)
            .optional(),

        code:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        name:
          Joi.string()
            .trim()
            .min(2)
            .max(160)
            .required(),

        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .required(),

        normalBalance:
          Joi.string()
            .valid(
              "debit",
              "credit"
            )
            .required(),
      }),
  },

  postJournal: {
    body:
      Joi.object({
        reference:
          Joi.string()
            .trim()
            .max(160)
            .optional(),

        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(160)
            .required(),

        transactionType:
          Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required(),

        description:
          Joi.string()
            .trim()
            .max(500)
            .allow("")
            .optional(),

        sourceType:
          Joi.string()
            .trim()
            .max(100)
            .optional(),

        sourceId:
          Joi.string()
            .uuid()
            .optional(),

        holdId:
          Joi.string()
            .uuid()
            .optional(),

        metadata:
          Joi.object()
            .unknown(true)
            .optional(),

        entries:
          Joi.array()
            .min(2)
            .items(
              Joi.object({
                ledgerAccountId:
                  Joi.string()
                    .uuid()
                    .required(),

                entryType:
                  Joi.string()
                    .valid(
                      "debit",
                      "credit"
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

                description:
                  Joi.string()
                    .trim()
                    .max(500)
                    .allow("")
                    .optional(),
              })
            )
            .required(),
      }),
  },

  reverseJournal: {
    params:
      Joi.object({
        journalId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        idempotencyKey:
          Joi.string()
            .trim()
            .min(8)
            .max(160)
            .required(),

        reference:
          Joi.string()
            .trim()
            .max(160)
            .optional(),

        reason:
          Joi.string()
            .trim()
            .min(3)
            .max(500)
            .required(),
      }),
  },

  ledgerAccountId: {
    params:
      Joi.object({
        ledgerAccountId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  createHold: {
    body:
      Joi.object({
        accountId:
          Joi.string()
            .uuid()
            .required(),

        reference:
          Joi.string()
            .trim()
            .min(3)
            .max(160)
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

        reason:
          Joi.string()
            .trim()
            .max(500)
            .allow("")
            .optional(),

        expiresAt:
          Joi.date()
            .iso()
            .greater("now")
            .optional(),
      }),
  },

  holdId: {
    params:
      Joi.object({
        holdId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  listJournals: {
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

        status:
          Joi.string()
            .valid(
              "pending",
              "posted",
              "reversed",
              "failed"
            )
            .optional(),

        transactionType:
          Joi.string()
            .trim()
            .max(100)
            .optional(),
      }),
  },
};
