const Joi =
  require("joi");

module.exports = {
  createDefinition: {
    body:
      Joi.object({
        code:
          Joi.string()
            .trim()
            .uppercase()
            .min(2)
            .max(140)
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

        queueName:
          Joi.string()
            .trim()
            .min(2)
            .max(120)
            .required(),

        jobName:
          Joi.string()
            .trim()
            .min(2)
            .max(140)
            .required(),

        scheduleType:
          Joi.string()
            .valid(
              "cron",
              "interval",
              "manual"
            )
            .required(),

        cronExpression:
          Joi.when(
            "scheduleType",
            {
              is: "cron",
              then:
                Joi.string()
                  .trim()
                  .max(120)
                  .required(),
              otherwise:
                Joi.forbidden(),
            }
          ),

        intervalSeconds:
          Joi.when(
            "scheduleType",
            {
              is: "interval",
              then:
                Joi.number()
                  .integer()
                  .min(60)
                  .required(),
              otherwise:
                Joi.forbidden(),
            }
          ),

        timezone:
          Joi.string()
            .trim()
            .max(120)
            .default("UTC"),

        payload:
          Joi.object()
            .unknown(true)
            .optional(),

        concurrencyLimit:
          Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(1),

        retryAttempts:
          Joi.number()
            .integer()
            .min(1)
            .max(20)
            .default(3),

        retryBackoffMs:
          Joi.number()
            .integer()
            .min(100)
            .max(3600000)
            .default(5000),

        timeoutMs:
          Joi.number()
            .integer()
            .min(1000)
            .max(86400000)
            .default(300000),

        status:
          Joi.string()
            .valid(
              "active",
              "paused",
              "disabled"
            )
            .default("active"),

        global:
          Joi.boolean()
            .default(false),
      }),
  },

  listDefinitions: {
    query:
      Joi.object({
        status:
          Joi.string()
            .valid(
              "active",
              "paused",
              "disabled"
            )
            .optional(),

        queueName:
          Joi.string()
            .trim()
            .max(120)
            .optional(),
      }),
  },

  definitionId: {
    params:
      Joi.object({
        definitionId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },

  updateStatus: {
    params:
      Joi.object({
        definitionId:
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
              "disabled"
            )
            .required(),
      }),
  },

  runNow: {
    params:
      Joi.object({
        definitionId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        payload:
          Joi.object()
            .unknown(true)
            .optional(),
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
              "queued",
              "processing",
              "completed",
              "failed",
              "cancelled",
              "dead_letter"
            )
            .optional(),

        jobCode:
          Joi.string()
            .trim()
            .max(140)
            .optional(),
      }),
  },
};
