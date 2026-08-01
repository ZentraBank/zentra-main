const Joi =
  require("joi");

const reportTypes = [
  "transfers",
  "accounts",
  "users",
  "subscriptions",
  "kyc",
  "loans",
  "investments",
  "donations",
];

const filters =
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
        .max(500)
        .default(50),

    dateFrom:
      Joi.date()
        .iso()
        .optional(),

    dateTo:
      Joi.date()
        .iso()
        .min(
          Joi.ref("dateFrom")
        )
        .optional(),

    status:
      Joi.string()
        .trim()
        .max(50)
        .optional(),

    currency:
      Joi.string()
        .uppercase()
        .length(3)
        .optional(),
  }).and(
    "dateFrom",
    "dateTo"
  );

module.exports = {
  report: {
    params:
      Joi.object({
        reportType:
          Joi.string()
            .valid(
              ...reportTypes
            )
            .required(),
      }),

    query:
      filters,
  },

  export: {
    params:
      Joi.object({
        reportType:
          Joi.string()
            .valid(
              ...reportTypes
            )
            .required(),
      }),

    query:
      filters.keys({
        format:
          Joi.string()
            .valid(
              "csv",
              "json"
            )
            .default("csv"),

        exportLimit:
          Joi.number()
            .integer()
            .min(1)
            .max(10000)
            .default(5000),
      }),
  },

  listExports: {
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
      }),
  },

  exportId: {
    params:
      Joi.object({
        exportId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },
};
