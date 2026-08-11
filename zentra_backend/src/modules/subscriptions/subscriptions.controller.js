const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./subscriptions.service");

const listPlans = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Subscription plans retrieved successfully",
    data: await service.listPlans({ tenantId: req.tenant.id })
  })
);

const getMine = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Subscription retrieved successfully",
    data: await service.getMine({
      tenantId: req.auth.tenantId,
      userId: req.auth.userId
    })
  })
);

const startUpgrade = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Subscription request created successfully",
    data: await service.startUpgrade({
      tenantId: req.auth.tenantId,
      userId: req.auth.userId,
      planCode: req.body.planCode
    })
  }, 201)
);

const submitProof = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Payment proof submitted successfully",
    data: await service.submitProof({
      auth: req.auth,
      requestId: req.params.requestId,
      body: req.body
    })
  })
);

const listPending = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Pending requests retrieved successfully",
    data: await service.listPending({
      tenantId: req.auth.tenantId,
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize)
    })
  })
);

const approve = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Subscription approved successfully",
    data: await service.approve({
      auth: req.auth,
      requestId: req.params.requestId,
      durationDays: Number(req.body.durationDays)
    })
  })
);

const reject = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Subscription rejected successfully",
    data: await service.reject({
      auth: req.auth,
      requestId: req.params.requestId,
      reason: req.body.reason
    })
  })
);

module.exports = {
  listPlans, getMine, startUpgrade,
  submitProof, listPending, approve, reject
};
