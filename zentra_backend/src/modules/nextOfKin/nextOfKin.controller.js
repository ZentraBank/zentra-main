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

  const listClaims =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listClaims({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Tenant POD claims retrieved successfully",

          data,
        }
      );
    }
  );

const getClaim =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getClaim({
          auth:
            req.auth,

          claimId:
            req.params.claimId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Tenant POD claim retrieved successfully",

          data,
        }
      );
    }
  );

const updateClaimStatus =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.updateClaimStatus({
          auth:
            req.auth,

          claimId:
            req.params.claimId,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "POD claim status updated successfully",

          data,
        }
      );
    }
  );

  const getClaimFile =
  asyncHandler(
    async (req, res) => {
      const file =
        await service.getClaimFile({
          auth:
            req.auth,

          claimId:
            req.params.claimId,

          fileId:
            req.params.fileId,
        });

      res.setHeader(
        "Content-Type",
        file.mimeType,
      );

      res.setHeader(
        "Content-Length",
        file.buffer.length,
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(
          file.originalName,
        )}"`,
      );

      return res.send(
        file.buffer,
      );
    }
  );

  const submitAdditionalInformation =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.submitAdditionalInformation({
          auth:
            req.auth,

          claimId:
            req.params.claimId,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "Additional POD information submitted successfully",

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
  listClaims,
  getClaim,
  updateClaimStatus,
  getClaimFile,
  submitAdditionalInformation,
};