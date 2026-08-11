const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./events.service");

const listEvents =
  asyncHandler(async (req, res) => {
    const data =
      await service.listEvents({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Domain events retrieved successfully",
      data,
    });
  });

module.exports = {
  listEvents,
};
