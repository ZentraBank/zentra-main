const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./approvals.service");

const createPolicy =
  asyncHandler(async (req, res) => {
    const data =
      await service.createPolicy({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Approval policy created successfully",
        data,
      },
      201
    );
  });

const listPolicies =
  asyncHandler(async (req, res) => {
    const data =
      await service.listPolicies({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Approval policies retrieved successfully",
      data,
    });
  });

const updatePolicy =
  asyncHandler(async (req, res) => {
    const data =
      await service.updatePolicy({
        auth: req.auth,
        policyId:
          req.params.policyId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Approval policy updated successfully",
      data,
    });
  });

const createRequest =
  asyncHandler(async (req, res) => {
    const data =
      await service.createRequest({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing approval request returned"
            : data.approvalRequired === false
            ? "No approval was required"
            : "Approval request created successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const decide =
  asyncHandler(async (req, res) => {
    const data =
      await service.decide({
        auth: req.auth,
        requestId:
          req.params.requestId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        data.executionReady
          ? "Approval request fully approved"
          : "Approval decision recorded successfully",
      data,
    });
  });

const getRequest =
  asyncHandler(async (req, res) => {
    const data =
      await service.getRequest({
        auth: req.auth,
        requestId:
          req.params.requestId,
      });

    return sendSuccess(res, {
      message:
        "Approval request retrieved successfully",
      data,
    });
  });

const listRequests =
  asyncHandler(async (req, res) => {
    const data =
      await service.listRequests({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Approval requests retrieved successfully",
      data,
    });
  });

const listMine =
  asyncHandler(async (req, res) => {
    const data =
      await service.listRequests({
        auth: req.auth,
        query: req.query,
        mine: true,
      });

    return sendSuccess(res, {
      message:
        "Your approval requests were retrieved successfully",
      data,
    });
  });

const cancelRequest =
  asyncHandler(async (req, res) => {
    const data =
      await service.cancelRequest({
        auth: req.auth,
        requestId:
          req.params.requestId,
      });

    return sendSuccess(res, {
      message:
        "Approval request cancelled successfully",
      data,
    });
  });

const expireRequests =
  asyncHandler(async (req, res) => {
    const count =
      await service.expireRequests({
        auth: req.auth,
      });

    return sendSuccess(res, {
      message:
        "Expired approval requests updated successfully",
      data: {
        updatedCount: count,
      },
    });
  });

module.exports = {
  createPolicy,
  listPolicies,
  updatePolicy,
  createRequest,
  decide,
  getRequest,
  listRequests,
  listMine,
  cancelRequest,
  expireRequests,
};
