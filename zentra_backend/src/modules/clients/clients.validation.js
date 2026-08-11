const Joi = require("joi");

const createClientSchema = {
  body: Joi.object({
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

    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required(),

    phone: Joi.string()
      .trim()
      .max(50)
      .allow("", null)
      .optional(),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/[A-Za-z]/)
      .pattern(/[0-9]/)
      .optional(),

    description: Joi.string()
      .trim()
      .max(1000)
      .allow("", null)
      .optional(),

    gender: Joi.string()
      .valid(
        "Male",
        "Female",
        "Other",
        "male",
        "female",
        "other",
      )
      .allow("", null)
      .optional(),

    nationality: Joi.string()
      .trim()
      .max(100)
      .allow("", null)
      .optional(),

    address: Joi.string()
      .trim()
      .max(500)
      .allow("", null)
      .optional(),

    kycType: Joi.string()
      .trim()
      .max(100)
      .allow("", null)
      .optional(),

    governmentId: Joi.string()
      .trim()
      .max(191)
      .allow("", null)
      .optional(),

    idNumber: Joi.string()
      .trim()
      .max(191)
      .allow("", null)
      .optional(),

    verificationStatus: Joi.string()
      .valid(
        "pending",
        "verified",
        "rejected",
      )
      .default("pending"),

    account: Joi.object({
      accountName: Joi.string()
        .trim()
        .min(2)
        .max(191)
        .optional(),

      accountType: Joi.string()
        .valid(
          "wallet",
          "savings",
          "current",
          "investment",
        )
        .default("savings"),

      currency: Joi.string()
        .trim()
        .uppercase()
        .length(3)
        .default("USD"),

      status: Joi.string()
        .valid(
          "active",
          "dormant",
          "suspended",
          "closed",
        )
        .default("active"),
    }).optional(),
  }).required(),
};

const clientIdSchema = {
  params: Joi.object({
    clientId: Joi.string()
      .guid({
        version: ["uuidv4"],
      })
      .required(),
  }).required(),
};

module.exports = {
  createClientSchema,
  clientIdSchema,
};