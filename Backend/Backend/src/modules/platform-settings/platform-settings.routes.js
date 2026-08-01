const router = require("express").Router();

const controller =
  require("./platform-settings.controller");

const schemas =
  require("./platform-settings.validation");

const validate =
  require("../../middleware/validate.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const {
  requirePlatformScope,
} = require("../../middleware/platform-scope.middleware");

const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");

router.use(authenticate);
router.use(requirePlatformScope);

router.get(
  "/",
  requireAllPermissions(
    "platform.settings.read"
  ),
  controller.list
);

router.get(
  "/:settingKey",
  validate(schemas.settingKey),
  requireAllPermissions(
    "platform.settings.read"
  ),
  controller.getOne
);

router.put(
  "/:settingKey",
  validate(schemas.upsert),
  requireAllPermissions(
    "platform.settings.manage"
  ),
  controller.upsert
);

router.get(
  "/:settingKey/history",
  validate(schemas.settingKey),
  requireAllPermissions(
    "platform.settings.read"
  ),
  controller.history
);

module.exports = router;
