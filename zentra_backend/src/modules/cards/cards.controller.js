const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./cards.service");

/*
|--------------------------------------------------------------------------
| Existing card handlers
|--------------------------------------------------------------------------
*/

const createCard = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    {
      message: "Card issued successfully",
      data: await service.createCard({
        auth: req.auth,
        body: req.body,
      }),
    },
    201
  )
);

const listOwnCards = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Cards retrieved successfully",
    data: await service.listOwnCards({
      auth: req.auth,
    }),
  })
);

const getOwnCard = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Card retrieved successfully",
    data: await service.getOwnCard({
      auth: req.auth,
      cardId: req.params.cardId,
    }),
  })
);

const changeOwnStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Card status updated successfully",
    data: await service.changeOwnStatus({
      auth: req.auth,
      cardId: req.params.cardId,
      status: req.body.status,
    }),
  })
);

const changeOwnLimit = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Card daily spend limit updated successfully",
    data: await service.changeOwnLimit({
      auth: req.auth,
      cardId: req.params.cardId,
      dailySpendLimit: req.body.dailySpendLimit,
    }),
  })
);

const changeStatusAsAdmin = asyncHandler(async (req, res) =>
  sendSuccess(res, {
    message: "Card status updated successfully",
    data: await service.changeStatusAsAdmin({
      auth: req.auth,
      cardId: req.params.cardId,
      status: req.body.status,
      reason: req.body.reason,
    }),
  })
);

/*
|--------------------------------------------------------------------------
| Customer card purchase requests
|--------------------------------------------------------------------------
*/

const submitPurchaseRequest = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    {
      message:
        "Card payment submitted for tenant-admin verification",
      data: await service.submitPurchaseRequest({
        auth: req.auth,
        body: req.body,
      }),
    },
    201
  )
);

const listOwnPurchaseRequests = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Card purchase requests retrieved successfully",
      data: await service.listOwnPurchaseRequests({
        auth: req.auth,
      }),
    })
);

const getOwnPurchaseRequest = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Card purchase request retrieved successfully",
      data: await service.getOwnPurchaseRequest({
        auth: req.auth,
        requestId: req.params.requestId,
      }),
    })
);

const cancelOwnPurchaseRequest = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Card purchase request cancelled successfully",
      data: await service.cancelOwnPurchaseRequest({
        auth: req.auth,
        requestId: req.params.requestId,
      }),
    })
);

/*
|--------------------------------------------------------------------------
| Tenant-admin card purchase requests
|--------------------------------------------------------------------------
*/

const listTenantPurchaseRequests = asyncHandler(
  async (req, res) => {
    const parsedPage = Number.parseInt(
      req.query.page,
      10
    );

    const parsedPageSize = Number.parseInt(
      req.query.pageSize || req.query.limit,
      10
    );

    const page =
      Number.isInteger(parsedPage) &&
      parsedPage > 0
        ? parsedPage
        : 1;

    const pageSize =
      Number.isInteger(parsedPageSize) &&
      parsedPageSize > 0
        ? Math.min(parsedPageSize, 100)
        : 20;

    const status = req.query.status || null;

    return sendSuccess(res, {
      message:
        "Tenant card purchase requests retrieved successfully",
      data:
        await service.listTenantPurchaseRequests({
          auth: req.auth,
          status,
          page,
          pageSize,
        }),
    });
  }
);

const getTenantPurchaseRequest = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Card purchase request retrieved successfully",
      data:
        await service.getTenantPurchaseRequest({
          auth: req.auth,
          requestId: req.params.requestId,
        }),
    })
);

const approvePurchaseRequest = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Card purchase request approved and card issued successfully",
      data:
        await service.approvePurchaseRequest({
          auth: req.auth,
          requestId: req.params.requestId,
        }),
    })
);

const rejectPurchaseRequest = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Card purchase request rejected successfully",
      data:
        await service.rejectPurchaseRequest({
          auth: req.auth,
          requestId: req.params.requestId,
          rejectionReason:
            req.body.rejectionReason,
        }),
    })
);

module.exports = {
  createCard,
  listOwnCards,
  getOwnCard,
  changeOwnStatus,
  changeOwnLimit,
  changeStatusAsAdmin,

  submitPurchaseRequest,
  listOwnPurchaseRequests,
  getOwnPurchaseRequest,
  cancelOwnPurchaseRequest,

  listTenantPurchaseRequests,
  getTenantPurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
};