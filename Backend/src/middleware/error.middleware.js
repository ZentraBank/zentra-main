const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const errorMiddleware = (
  error,
  req,
  res,
  next
) => {
  let statusCode = error.statusCode || 500;
  let message =
    error.message || "Internal server error";

  if (
    error.code === "ER_DUP_ENTRY"
  ) {
    statusCode = 409;
    message =
      "A record with this information already exists";
  }

  if (
    error.code ===
    "ER_NO_REFERENCED_ROW_2"
  ) {
    statusCode = 400;
    message =
      "A referenced record does not exist";
  }

  if (
    error.name === "JsonWebTokenError"
  ) {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (
    error.name === "TokenExpiredError"
  ) {
    statusCode = 401;
    message =
      "Authentication token has expired";
  }

  const response = {
    success: false,
    message,
  };

const validationErrors =
  error.errors || error.details || null;

if (validationErrors) {
  response.errors = validationErrors;
}

  if (env.isDevelopment) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;