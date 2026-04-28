const express = require("express");
const subscriptionController = require("./subscription.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const { requestSubscriptionSchema } = require("./subscription.validation");


const router = express.Router();

router.use(authMiddleware);

router.post(
  "/request",
  validate(requestSubscriptionSchema),
  subscriptionController.requestSubscription
);

// router.post("/request", subscriptionController.requestSubscription);
router.get("/current", subscriptionController.getCurrentSubscription);
router.get("/admin/requests", subscriptionController.getSubscriptionRequests);
router.patch("/admin/:id/approve", subscriptionController.approveSubscription);
router.patch("/admin/:id/reject", subscriptionController.rejectSubscription);

module.exports = router;