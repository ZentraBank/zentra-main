const Joi = require("joi");

const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().max(150).required(),
  phone: Joi.string().max(30).allow("", null),
  password: Joi.string().min(8).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};