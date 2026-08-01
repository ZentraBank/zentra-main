const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./recurring.service");

const createMandate =
  asyncHandler(async (req, res) => {
    const data =
      await service.createMandate({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Payment mandate created successfully",
        data,
      },
      201
    );
  });

const listMine =
  asyncHandler(async (req, res) => {
    const data =
      await service.listMandates({
        auth: req.auth,
        query: req.query,
        mine: true,
      });

    return sendSuccess(res, {
      message:
        "Your payment mandates were retrieved successfully",
      data,
    });
  });

const listMandates =
  asyncHandler(async (req, res) => {
    const data =
      await service.listMandates({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Payment mandates retrieved successfully",
      data,
    });
  });

const createAuthorisation =
  asyncHandler(async (req, res) => {
    const data =
      await service.createAuthorisation({
        auth: req.auth,
        mandateId:
          req.params.mandateId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Mandate authorisation created successfully",
        data,
      },
      201
    );
  });

const confirmAuthorisation =
  asyncHandler(async (req, res) => {
    const data =
      await service.confirmAuthorisation({
        auth: req.auth,
        authorisationId:
          req.params.authorisationId,
      });

    return sendSuccess(res, {
      message:
        "Mandate authorisation confirmed successfully",
      data,
    });
  });

const changeMandateStatus =
  asyncHandler(async (req, res) => {
    const data =
      await service.changeMandateStatus({
        auth: req.auth,
        mandateId:
          req.params.mandateId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Payment mandate status updated successfully",
      data,
    });
  });

const executeDueSchedules =
  asyncHandler(async (req, res) => {
    const data =
      await service.executeDueSchedules({
        tenantId:
          req.auth.tenantId,
        limit:
          req.body.limit,
      });

    return sendSuccess(res, {
      message:
        "Due recurring payments processed",
      data,
    });
  });

module.exports = {
  createMandate,
  listMine,
  listMandates,
  createAuthorisation,
  confirmAuthorisation,
  changeMandateStatus,
  executeDueSchedules,
};
