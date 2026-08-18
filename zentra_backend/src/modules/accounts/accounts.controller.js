const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./accounts.service");

const listOwn = asyncHandler(async (req, res) => {
  const data = await service.listOwn({
    userId: req.auth.userId,
    tenantId: req.auth.tenantId
  });
  return sendSuccess(res, {
    message: "Accounts retrieved successfully",
    data
  });
});

const getOwn = asyncHandler(async (req, res) => {
  const data = await service.getOwn({
    accountId: req.params.accountId,
    userId: req.auth.userId,
    tenantId: req.auth.tenantId
  });
  return sendSuccess(res, {
    message: "Account retrieved successfully",
    data
  });
});

const createOwn = asyncHandler(async (req, res) => {
  const data = await service.createOwn({
    auth: req.auth,
    body: req.body
  });
  return sendSuccess(res, {
    message: "Account created successfully",
    data
  }, 201);
});

const setStatus = asyncHandler(async (req, res) => {
  const data = await service.setStatus({
    accountId: req.params.accountId,
    tenantId: req.auth.tenantId,
    status: req.body.status
  });
  return sendSuccess(res, {
    message: "Account status updated successfully",
    data
  });
});

const listTenantAccounts = asyncHandler(async (req, res) => {
  const data = await service.listTenantAccounts({
    tenantId: req.auth.tenantId,
  });

  return sendSuccess(res, {
    message: "Tenant accounts retrieved successfully",
    data,
  });
});

const getTenantAccount = asyncHandler(
  async (req, res) => {
    const data =
      await service.getTenantAccount({
        tenantId:
          req.auth.tenantId,
        accountId:
          req.params.accountId,
      });

    return sendSuccess(res, {
      message:
        "Tenant account retrieved successfully",
      data,
    });
  }
);

module.exports = { listOwn, getOwn, createOwn, setStatus, listTenantAccounts, getTenantAccount };
