const Joi = require("joi");

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Za-z]/)
  .pattern(/[0-9]/)
  .required();

const email = Joi.string()
  .trim()
  .lowercase()
  .email()
  .required();

const otp = Joi.string()
  .pattern(/^\d{6}$/)
  .required();

const loginSchema = {
  body: Joi.object({
    email,
    password,
  }).required(),
};

const registerSchema = {
  body: Joi.object({
    inviteCode: Joi.string()
      .trim()
      .uppercase()
      .pattern(
        /^ZB-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{2}$/
      )
      .required()
      .messages({
        "any.required":
          "Invitation code is required",

        "string.empty":
          "Invitation code is required",

        "string.pattern.base":
          "Invitation code is invalid",
      }),

    firstName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),

    middleName: Joi.string()
      .trim()
      .max(100)
      .allow("", null)
      .optional(),

    lastName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),

    email,

    phone: Joi.string()
      .trim()
      .max(50)
      .allow("", null)
      .optional(),

    password,
  }).required(),
};

const verifyRegistrationSchema = {
  body: Joi.object({
    email,
    code: otp,
  }).required(),
};

const resendRegistrationSchema = {
  body: Joi.object({
    email,
  }).required(),
};

const forgotPasswordSchema = {
  body: Joi.object({
    email,
  }).required(),
};

const resetPasswordSchema = {
  body: Joi.object({
    email,
    code: otp,
    newPassword: password,
  }).required(),
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string()
      .min(8)
      .max(128)
      .required(),

    newPassword: password,
  }).required(),
};

const refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string()
      .min(32)
      .optional(),
  }).required(),
};

const logoutSchema = {
  body: Joi.object({
    refreshToken: Joi.string()
      .min(32)
      .optional(),
  }).required(),
};

module.exports = {
  loginSchema,
  registerSchema,
  verifyRegistrationSchema,
  resendRegistrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshSchema,
  logoutSchema,
};