const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");

const testAccountsRead = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: "Permission check successful",
    data: {
      userId: req.auth.userId,
      tenantId: req.auth.tenantId,
      role: req.auth.role,
      permissions: req.auth.permissions,
    },
  });
});

module.exports = {
  testAccountsRead,
};