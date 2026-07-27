const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./kyc.service");

const saveProfile =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.createOrUpdate({
          auth:
            req.auth,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "KYC profile saved successfully",

          data,
        }
      );
    }
  );

const getMine =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getMine({
          auth:
            req.auth,
        });

      return sendSuccess(
        res,
        {
          message:
            "KYC profile retrieved successfully",

          data,
        }
      );
    }
  );

const addDocument =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.addDocument({
          auth:
            req.auth,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "KYC document uploaded successfully",

          data,
        },
        201
      );
    }
  );

const submit =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.submit({
          auth:
            req.auth,
        });

      return sendSuccess(
        res,
        {
          message:
            "KYC submitted successfully",

          data,
        }
      );
    }
  );

const listPending =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listPending({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "KYC applications retrieved successfully",

          data,
        }
      );
    }
  );

const review =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.review({
          auth:
            req.auth,

          profileId:
            req.params.profileId,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "KYC review completed successfully",

          data,
        }
      );
    }
  );

module.exports = {
  saveProfile,
  getMine,
  addDocument,
  submit,
  listPending,
  review,
};
