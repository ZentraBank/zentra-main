const express = require("express");
const chatController = require("./chat.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { resolveTenantMiddleware } = require("../../middleware/tenant.middleware");
const validate = require("../../middleware/validate.middleware");

const {
  startConversationSchema,
  sendMessageSchema,
} = require("./chat.validation");

const router = express.Router();

router.use(resolveTenantMiddleware);
router.use(authenticate);


router.post(
  "/conversations",
  validate(startConversationSchema),
  chatController.startConversation
);

router.get("/conversations", chatController.getConversations);

router.get(
  "/conversations/:id/messages",
  chatController.getConversationMessages
);

router.post(
  "/conversations/:id/messages",
  validate(sendMessageSchema),
  chatController.sendMessage
);

router.patch("/conversations/:id/close", chatController.closeConversation);

module.exports = router;