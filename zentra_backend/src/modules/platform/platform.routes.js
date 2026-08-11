const express = require("express");
const platformController = require("./platform.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const Joi = require("joi");

const router = express.Router();

router.use(authMiddleware);

const subscriptionStatusSchema = Joi.object({
  subscription_status: Joi.string()
    .valid("trial", "active", "expired", "suspended")
    .required(),
});

router.get("/tenants", platformController.getTenants);
router.get("/tenants/:id", platformController.getTenantDetails);

router.patch("/tenants/:id/suspend", platformController.suspendTenant);
router.patch("/tenants/:id/activate", platformController.activateTenant);

router.patch(
  "/tenants/:id/subscription-status",
  validate(subscriptionStatusSchema),
  platformController.updateTenantSubscriptionStatus
);

router.get("/analytics", platformController.getGlobalDashboard);

module.exports = router;