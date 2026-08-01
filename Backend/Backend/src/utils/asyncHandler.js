const asyncHandler = (handler) => {
  if (typeof handler !== "function") {
    throw new TypeError(
      "asyncHandler expects a route handler function"
    );
  }

  return function wrappedRouteHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;