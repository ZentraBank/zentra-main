const Joi =
  require("joi");

module.exports = {
  listEvents: {
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

        eventType:
          Joi.string()
            .trim()
            .max(160)
            .optional(),

        status:
          Joi.string()
            .valid(
              "pending",
              "published",
              "failed"
            )
            .optional(),

        fromDate:
          Joi.date()
            .iso()
            .optional(),

        toDate:
          Joi.date()
            .iso()
            .optional(),
      }),
  },
};
