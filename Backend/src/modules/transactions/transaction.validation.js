const Joi = require("joi");

const transferSchema = Joi.object({
  from_account_id: Joi.number().integer().positive().required(),
  to_account_number: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(255).allow("", null),
});

const adminCreditSchema = Joi.object({
  account_id: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(255).allow("", null),
});

const adminDebitSchema = Joi.object({
  account_id: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(255).allow("", null),
});

module.exports = {
  transferSchema,
  adminCreditSchema,
  adminDebitSchema,
};