const router = require("express").Router();
const controller = require("./client-transactions.controller");
const { resolveTenantMiddleware } = require("../../middleware/tenant.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireAllPermissions } = require("../../middleware/permission.middleware");

router.use(resolveTenantMiddleware);
router.use(authenticate);
router.get("/me", requireAllPermissions("transactions.read"), controller.listOwn);
router.get("/me/:id", requireAllPermissions("transactions.read"), controller.getOwn);
module.exports = router;
