const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./privacy.service");

const createPurpose =
  asyncHandler(async (req, res) => {
    const data =
      await service.createPurpose({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Privacy processing purpose created successfully",
        data,
      },
      201
    );
  });

const grantConsent =
  asyncHandler(async (req, res) => {
    const data =
      await service.grantConsent({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing active privacy consent returned"
            : "Privacy consent granted successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const withdrawConsent =
  asyncHandler(async (req, res) => {
    const data =
      await service.withdrawConsent({
        auth: req.auth,
        consentId:
          req.params.consentId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Privacy consent withdrawn successfully",
      data,
    });
  });

const createDataSubjectRequest =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .createDataSubjectRequest({
          auth: req.auth,
          body: req.body,
        });

    return sendSuccess(
      res,
      {
        message:
          "Data subject request created successfully",
        data,
      },
      201
    );
  });

const updateDataSubjectRequest =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .updateDataSubjectRequest({
          auth: req.auth,
          requestId:
            req.params.requestId,
          body: req.body,
        });

    return sendSuccess(res, {
      message:
        "Data subject request updated successfully",
      data,
    });
  });

const createRetentionPolicy =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .createRetentionPolicy({
          auth: req.auth,
          body: req.body,
        });

    return sendSuccess(
      res,
      {
        message:
          "Data retention policy created successfully",
        data,
      },
      201
    );
  });

const createRetentionRun =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .createRetentionRun({
          auth: req.auth,
          policyId:
            req.params.policyId,
        });

    return sendSuccess(
      res,
      {
        message:
          "Retention execution run created successfully",
        data,
      },
      201
    );
  });

const approveRetentionRun =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .approveRetentionRun({
          auth: req.auth,
          runId:
            req.params.runId,
        });

    return sendSuccess(res, {
      message:
        "Retention execution run approved successfully",
      data,
    });
  });

const createLegalHold =
  asyncHandler(async (req, res) => {
    const data =
      await service.createLegalHold({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Privacy legal hold created successfully",
        data,
      },
      201
    );
  });

const releaseLegalHold =
  asyncHandler(async (req, res) => {
    const data =
      await service.releaseLegalHold({
        auth: req.auth,
        holdId:
          req.params.holdId,
      });

    return sendSuccess(res, {
      message:
        "Privacy legal hold released successfully",
      data,
    });
  });

const createIncident =
  asyncHandler(async (req, res) => {
    const data =
      await service.createIncident({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Privacy incident created successfully",
        data,
      },
      201
    );
  });

module.exports = {
  createPurpose,
  grantConsent,
  withdrawConsent,
  createDataSubjectRequest,
  updateDataSubjectRequest,
  createRetentionPolicy,
  createRetentionRun,
  approveRetentionRun,
  createLegalHold,
  releaseLegalHold,
  createIncident,
};
