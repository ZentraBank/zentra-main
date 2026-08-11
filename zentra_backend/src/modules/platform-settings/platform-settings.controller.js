const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./platform-settings.service");

module.exports = {
  list: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform settings loaded successfully.",
      data: await service.listSettings(),
    })
  ),

  getOne: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform setting loaded successfully.",
      data: await service.getSetting(
        req.params.settingKey
      ),
    })
  ),

  upsert: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform setting saved successfully.",
      data: await service.upsertSetting({
        auth: req.auth,
        settingKey: req.params.settingKey,
        body: req.body,
      }),
    })
  ),

  history: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message:
        "Platform setting history loaded successfully.",
      data: await service.listHistory({
        settingKey: req.params.settingKey,
        query: req.query,
      }),
    })
  ),
};
