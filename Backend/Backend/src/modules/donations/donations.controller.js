const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./donations.service");

const createDonor =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.createDonor({
          auth:
            req.auth,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donor created successfully",

          data,
        },
        201
      );
    }
  );

const listDonors =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listDonors({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donors retrieved successfully",

          data,
        }
      );
    }
  );

const updateDonor =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.updateDonor({
          auth:
            req.auth,

          donorId:
            req.params.donorId,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donor updated successfully",

          data,
        }
      );
    }
  );

const createRequest =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.createDonationRequest({
          auth:
            req.auth,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donation request created successfully",

          data,
        },
        201
      );
    }
  );

const listMine =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listRequests({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donation requests retrieved successfully",

          data,
        }
      );
    }
  );

const listAdmin =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listRequests({
          auth:
            req.auth,

          query:
            req.query,

          adminView:
            true,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donation requests retrieved successfully",

          data,
        }
      );
    }
  );

const review =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.reviewRequest({
          auth:
            req.auth,

          requestId:
            req.params.requestId,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donation request reviewed successfully",

          data,
        }
      );
    }
  );

const requestRedemption =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.requestRedemption({
          auth:
            req.auth,

          requestId:
            req.params.requestId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Redemption OTP generated successfully",

          data,
        },
        201
      );
    }
  );

const verifyOtp =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.verifyRedemptionOtp({
          auth:
            req.auth,

          redemptionId:
            req.params.redemptionId,

          otp:
            req.body.otp,
        });

      return sendSuccess(
        res,
        {
          message:
            "Redemption OTP verified successfully",

          data,
        }
      );
    }
  );

  const getMine =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getOwnRequest({
          auth: req.auth,
          requestId:
            req.params.requestId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donation request retrieved successfully",
          data,
        }
      );
    }
  );

const complete =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.completeRedemption({
          auth:
            req.auth,

          redemptionId:
            req.params.redemptionId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Donation redemption completed successfully",

          data,
        }
      );
    }
  );

module.exports = {
  createDonor,
  listDonors,
  updateDonor,
  createRequest,
  listMine,
  listAdmin,
  review,
  requestRedemption,
  verifyOtp,
  complete,
  getMine,
};
