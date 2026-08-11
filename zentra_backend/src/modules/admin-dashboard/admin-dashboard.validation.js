const Joi =
  require("joi");

const dateRange =
  Joi.object({
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

    granularity:
      Joi.string()
        .valid(
          "day",
          "week",
          "month"
        )
        .default("day"),

    activityLimit:
      Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),
  }).and(
    "dateFrom",
    "dateTo"
  );

module.exports = {
  dashboardQuery: {
    query:
      dateRange,
  },

  dateRangeQuery: {
    query:
      Joi.object({
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

        granularity:
          Joi.string()
            .valid(
              "day",
              "week",
              "month"
            )
            .default("day"),
      }).and(
        "dateFrom",
        "dateTo"
      ),
  },

  recentActivityQuery: {
    query:
      Joi.object({
        limit:
          Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(20),
      }),
  },
};
