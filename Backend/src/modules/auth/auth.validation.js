const Joi = require("joi");

const password = Joi.string().min(8).max(128).pattern(/[A-Za-z]/).pattern(/[0-9]/).required();
const email = Joi.string().trim().lowercase().email().required();
const otp = Joi.string().pattern(/^\d{6}$/).required();

const loginSchema = { body: Joi.object({ email, password }) };
const registerSchema = { body: Joi.object({
  firstName: Joi.string().trim().min(2).max(100).required(),
  middleName: Joi.string().trim().max(100).allow("", null).optional(),
  lastName: Joi.string().trim().min(2).max(100).required(),
  email,
  phone: Joi.string().trim().max(50).allow("", null).optional(),
  password,
}) };
const verifyRegistrationSchema = { body: Joi.object({ email, code: otp }) };
const resendRegistrationSchema = { body: Joi.object({ email }) };
const forgotPasswordSchema = { body: Joi.object({ email }) };
const resetPasswordSchema = { body: Joi.object({ email, code: otp, newPassword: password }) };
const changePasswordSchema = { body: Joi.object({ currentPassword: Joi.string().min(8).max(128).required(), newPassword: password }) };
const refreshSchema = { body: Joi.object({ refreshToken: Joi.string().min(32).optional() }) };
const logoutSchema = { body: Joi.object({ refreshToken: Joi.string().min(32).optional() }) };

module.exports = { loginSchema, registerSchema, verifyRegistrationSchema, resendRegistrationSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, refreshSchema, logoutSchema };
