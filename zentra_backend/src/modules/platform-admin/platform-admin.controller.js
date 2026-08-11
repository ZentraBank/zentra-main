const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./platform-admin.service");

module.exports = {
  listUsers: asyncHandler(async (req, res) => {
    const result = await service.listUsers({
      query: req.query,
    });

    return sendSuccess(res, {
      message:
        "Platform administrators loaded successfully.",
      data: result.rows,
      meta: result.meta,
    });
  }),

  getUser: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform administrator loaded successfully.",
      data: await service.getUser(
        req.params.userId
      ),
    })
  ),

  createUser: asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      {
        message:
          "Platform administrator created successfully.",
        data: await service.createUser({
          auth: req.auth,
          body: req.body,
        }),
      },
      201
    )
  ),

  updateUser: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform administrator updated successfully.",
      data: await service.updateUser({
        userId: req.params.userId,
        body: req.body,
      }),
    })
  ),

  updatePermissions: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Platform permissions updated successfully.",
        data:
          await service.updatePermissions({
            auth: req.auth,
            userId: req.params.userId,
            permissions:
              req.body.permissions,
          }),
      })
  ),

  updateStatus: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform administrator status updated successfully.",
      data: await service.updateStatus({
        auth: req.auth,
        userId: req.params.userId,
        status: req.body.status,
      }),
    })
  ),
};
