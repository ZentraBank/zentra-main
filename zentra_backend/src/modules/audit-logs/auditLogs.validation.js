const Joi = require("joi");

const listSchema = {
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    pageSize: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),

    actorUserId:
      Joi.string()
        .uuid()
        .optional(),

    action:
      Joi.string()
        .trim()
        .min(2)
        .max(120)
        .optional(),

    entityType:
      Joi.string()
        .trim()
        .min(2)
        .max(80)
        .optional(),

    entityId:
      Joi.string()
        .uuid()
        .optional(),

    status:
      Joi.string()
        .valid(
          "success",
          "failure"
        )
        .optional(),

    dateFrom:
      Joi.date()
        .iso()
        .optional(),

    dateTo:
      Joi.date()
        .iso()
        .greater(
          Joi.ref("dateFrom")
        )
        .optional(),
  }),
};

const idSchema = {
  params: Joi.object({
    auditLogId:
      Joi.string()
        .uuid()
        .required(),
  }),
};

module.exports = {
  listSchema,
  idSchema,
};
