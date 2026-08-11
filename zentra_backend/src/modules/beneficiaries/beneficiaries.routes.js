const router = require("express").Router();
const controller = require("./beneficiaries.controller");
const schema = require("./beneficiaries.validation");
const validate = require("../../middleware/validate.middleware");
const { resolveTenantMiddleware } = require("../../middleware/tenant.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireAllPermissions } = require("../../middleware/permission.middleware");

router.use(resolveTenantMiddleware);
router.use(authenticate);
router.post("/",validate(schema.create),requireAllPermissions("beneficiaries.create"),controller.create);
router.get("/me",validate(schema.list),requireAllPermissions("beneficiaries.read"),controller.listMine);
router.get("/me/:beneficiaryId",validate(schema.id),requireAllPermissions("beneficiaries.read"),controller.getMine);
router.patch("/me/:beneficiaryId",validate(schema.update),requireAllPermissions("beneficiaries.manage"),controller.updateMine);
router.delete("/me/:beneficiaryId",validate(schema.id),requireAllPermissions("beneficiaries.manage"),controller.removeMine);
module.exports = router;
