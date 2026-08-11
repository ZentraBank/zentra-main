const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = undefined,
  } = {}
) => {
  const responseBody = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
};

const sendCreated = (
  res,
  {
    message = "Resource created successfully",
    data = null,
  } = {}
) => {
  return sendSuccess(res, {
    statusCode: 201,
    message,
    data,
  });
};

const sendNoContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendNoContent,
};