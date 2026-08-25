const asyncHandler =
  require(
    "../../utils/asyncHandler"
  );

const {
  sendSuccess,
} = require(
  "../../utils/response"
);

const service =
  require(
    "./gifts.service"
  );

/*
|--------------------------------------------------------------------------
| Tenant: create gift
|--------------------------------------------------------------------------
*/

const createGift =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.createGift({
          auth:
            req.auth,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "Gift created successfully",

          data,
        },
        201
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: list gifts
|--------------------------------------------------------------------------
*/

const listTenant =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listTenant({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Gifts retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: gift details
|--------------------------------------------------------------------------
*/

const getTenantGift =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getTenantGift({
          auth:
            req.auth,

          giftId:
            req.params.giftId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Gift retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Tenant: cancel pending gift
|--------------------------------------------------------------------------
*/

const cancelGift =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.cancelGift({
          auth:
            req.auth,

          giftId:
            req.params.giftId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Gift cancelled successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: list my gifts
|--------------------------------------------------------------------------
*/

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
            "Your gifts were retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: gift details
|--------------------------------------------------------------------------
*/

const getMine =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getMine({
          auth:
            req.auth,

          giftId:
            req.params.giftId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Gift retrieved successfully",

          data,
        }
      );
    }
  );

/*
|--------------------------------------------------------------------------
| Client: accept / decline
|--------------------------------------------------------------------------
*/

const decideGift =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.decideGift({
          auth:
            req.auth,

          giftId:
            req.params.giftId,

          decision:
            req.body.decision,
        });

      return sendSuccess(
        res,
        {
          message:
            req.body.decision ===
            "accepted"
              ? "Gift accepted successfully"
              : "Gift declined successfully",

          data,
        }
      );
    }
  );

  const uploadRedemptionProofFile =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.uploadRedemptionProofFile({
          auth: req.auth,

          giftId:
            req.params.giftId,

          file:
            req.file,
        });

      return sendSuccess(res, {
        statusCode: 201,

        message:
          "Redemption proof file uploaded successfully",

        data,
      });
    }
  );
  const submitRedemptionProof =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.submitRedemptionProof({
          auth: req.auth,

          giftId:
            req.params.giftId,

          body: req.body,
        });

      return sendSuccess(res, {
        statusCode: 201,

        message:
          "Redemption proof submitted successfully",

        data,
      });
    }
  );

const getMyRedemptionProof =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getMyRedemptionProof({
          auth: req.auth,

          giftId:
            req.params.giftId,
        });

      return sendSuccess(res, {
        message:
          "Redemption proof retrieved successfully",

        data,
      });
    }
  );

const getRedemptionProof =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getRedemptionProof({
          auth: req.auth,

          giftId:
            req.params.giftId,
        });

      return sendSuccess(res, {
        message:
          "Redemption proof retrieved successfully",

        data,
      });
    }
  );

const reviewRedemptionProof =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.reviewRedemptionProof({
          auth: req.auth,

          giftId:
            req.params.giftId,

          body: req.body,
        });

      return sendSuccess(res, {
        message:
          req.body.status ===
          "approved"
            ? "Redemption proof approved successfully"
            : "Redemption proof rejected successfully",

        data,
      });
    }
  );

  const updateGift =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.updateGift({
          auth:
            req.auth,

          giftId:
            req.params.giftId,

          body:
            req.body,
        });

      return sendSuccess(
        res,
        {
          message:
            "Gift updated successfully",

          data,
        }
      );
    }
    
  );

module.exports = {
  createGift,

  listTenant,
  getTenantGift,
  cancelGift,

  listMine,
  getMine,
  decideGift,

  updateGift,

  uploadRedemptionProofFile,
  submitRedemptionProof,
  getMyRedemptionProof,
  getRedemptionProof,
  reviewRedemptionProof,
};