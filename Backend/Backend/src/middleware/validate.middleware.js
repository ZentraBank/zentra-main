const ApiError = require("../utils/ApiError");

const validateOne = (schema, value) => schema.validate(value, {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
});

const validate = (schema, property = "body") => (req, res, next) => {
  const targets = schema && (schema.body || schema.query || schema.params)
    ? ["body", "query", "params"].filter((key) => schema[key])
    : [property];

  for (const target of targets) {
    const currentSchema = schema[target] || schema;
    const { error, value } = validateOne(currentSchema, req[target]);

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));
      const validationError = ApiError.validation("Validation failed");
      validationError.details = details;
      return next(validationError);
    }

    req[target] = value;
  }

  return next();
};

module.exports = validate;
