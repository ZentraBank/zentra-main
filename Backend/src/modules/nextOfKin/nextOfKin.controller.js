const asyncHandler =
  require(
    "../../utils/asyncHandler"
  );

const {
  sendSuccess,
} =
  require(
    "../../utils/response"
  );

const service =
  require(
    "./nextOfKin.service"
  );

const uploadFile =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.uploadFile({
          auth:
            req.auth,

          documentType:
            req.body.documentType,

          file:
            req.file,
        });

      return sendSuccess(
        res,
        {
          message:
            "POD document uploaded successfully",

          data,
        },
        201
      );
    }
  );

const createClaim =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.createClaim({
          auth:
            req.auth,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "POD claim submitted successfully",

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
        await service.listMine({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "POD claims retrieved successfully",

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

          claimId:
            req.params.claimId,
        });

      return sendSuccess(
        res,
        {
          message:
            "POD claim retrieved successfully",

          data,
        }
      );
    }
  );

module.exports = {
  uploadFile,
  createClaim,
  listMine,
  getMine,
};