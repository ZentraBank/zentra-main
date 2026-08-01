const Joi = require("joi");

module.exports = {
  create: {
    body: Joi.object({
      accountId: Joi.string().uuid().required(),
      cardType: Joi.string().valid(
        "virtual","physical","celebrity","cryptocurrency","official","merchant"
      ).required(),
      cardBrand: Joi.string().trim().min(2).max(30).default("Zentra")
    })
  },
  id: {
    params: Joi.object({ cardId: Joi.string().uuid().required() })
  },
  ownStatus: {
    params: Joi.object({ cardId: Joi.string().uuid().required() }),
    body: Joi.object({ status: Joi.string().valid("active","frozen").required() })
  },
  adminStatus: {
    params: Joi.object({ cardId: Joi.string().uuid().required() }),
    body: Joi.object({
      status: Joi.string().valid("active","frozen","blocked","inactive").required(),
      reason: Joi.string().trim().max(500).allow("").optional()
    })
  }
};
