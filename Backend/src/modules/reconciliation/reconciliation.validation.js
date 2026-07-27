const Joi =
  require("joi");

module.exports = {
  runLedgerVsAccounts: {
    body:
      Joi.object({
        currency:
          Joi.string()
            .uppercase()
            .length(3)
            .optional(),

        tolerance:
          Joi.number()
            .min(0)
            .precision(2)
            .default(0.01),
      }),
  },

  listRuns: {
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
              "processing",
              "completed",
              "failed"
            )
            .optional(),

        runType:
          Joi.string()
            .valid(
              "ledger_vs_accounts",
              "external_statement"
            )
            .optional(),
      }),
  },

  runId: {
    params:
      Joi.object({
        runId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  listItems: {
    params:
      Joi.object({
        runId:
          Joi.string()
            .uuid()
            .required(),
      }),

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
            .default(50),

        status:
          Joi.string()
            .valid(
              "matched",
              "mismatched",
              "investigating",
              "resolved",
              "ignored"
            )
            .optional(),
      }),
  },

  updateItem: {
    params:
      Joi.object({
        itemId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "investigating",
              "resolved",
              "ignored"
            )
            .required(),

        resolutionNote:
          Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional(),
      }),
  },
};
