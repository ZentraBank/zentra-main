const Joi =
  require("joi");

module.exports = {
  createEndpoint: {
    body:
      Joi.object({
        name:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .required(),

        endpointUrl:
          Joi.string()
            .uri({
              scheme: [
                "https",
              ],
            })
            .max(1000)
            .required(),

        secret:
          Joi.string()
            .min(24)
            .max(500)
            .required(),

        subscribedEvents:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .min(1)
                .max(160)
            )
            .min(1)
            .unique()
            .required(),

        status:
          Joi.string()
            .valid(
              "active",
              "paused",
              "disabled"
            )
            .default("active"),

        timeoutMs:
          Joi.number()
            .integer()
            .min(1000)
            .max(60000)
            .default(10000),

        maxAttempts:
          Joi.number()
            .integer()
            .min(1)
            .max(20)
            .default(8),
      }),
  },

  updateEndpoint: {
    params:
      Joi.object({
        endpointId:
          Joi.string()
            .uuid()
            .required(),
      }),

    body:
      Joi.object({
        name:
          Joi.string()
            .trim()
            .min(2)
            .max(180)
            .optional(),

        endpointUrl:
          Joi.string()
            .uri({
              scheme: [
                "https",
              ],
            })
            .max(1000)
            .optional(),

        secret:
          Joi.string()
            .min(24)
            .max(500)
            .optional(),

        subscribedEvents:
          Joi.array()
            .items(
              Joi.string()
                .trim()
                .min(1)
                .max(160)
            )
            .min(1)
            .unique()
            .optional(),

        status:
          Joi.string()
            .valid(
              "active",
              "paused",
              "disabled"
            )
            .optional(),

        timeoutMs:
          Joi.number()
            .integer()
            .min(1000)
            .max(60000)
            .optional(),

        maxAttempts:
          Joi.number()
            .integer()
            .min(1)
            .max(20)
            .optional(),
      }).min(1),
  },

  listEndpoints: {
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
      }),
  },

  listDeliveries: {
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

        endpointId:
          Joi.string()
            .uuid()
            .optional(),

        status:
          Joi.string()
            .valid(
              "pending",
              "processing",
              "delivered",
              "failed",
              "dead_letter"
            )
            .optional(),
      }),
  },

  replayDelivery: {
    params:
      Joi.object({
        deliveryId:
          Joi.string()
            .uuid()
            .required(),
      }),
  },
};
