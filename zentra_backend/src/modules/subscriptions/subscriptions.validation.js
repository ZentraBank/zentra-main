const Joi = require("joi");

module.exports = {
  startUpgrade: {
    body: Joi.object({
      planCode: Joi.string()
        .valid("bronze", "gold", "diamond")
        .required()
    })
  },
  proof: {
    params: Joi.object({
      requestId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      paymentReference: Joi.string().trim().min(3).max(120).required(),
      paymentProofUrl: Joi.string().uri().max(2000).required(),
      paymentNote: Joi.string().trim().max(500).allow("").optional()
    })
  },
  pending: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20)
    })
  },
  approve: {
    params: Joi.object({
      requestId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      durationDays: Joi.number().integer().min(1).max(3650).default(30)
    })
  },
  reject: {
    params: Joi.object({
      requestId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      reason: Joi.string().trim().min(3).max(500).required()
    })
  }
};
