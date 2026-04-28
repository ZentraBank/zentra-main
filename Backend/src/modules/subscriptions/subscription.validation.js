const Joi = require("joi");

const requestSubscriptionSchema = Joi.object({
  plan_name: Joi.string().min(2).max(100).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid("USDT", "NGN", "USD", "GBP").default("USDT"),
  payment_reference: Joi.string().max(150).allow("", null),
  payment_note: Joi.string().max(500).allow("", null),
});

module.exports = {
  requestSubscriptionSchema,
};