const express = require("express");
const chatController = require("./chat.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);


const validate = require("../../middleware/validate.middleware");

const {
  startConversationSchema,
  sendMessageSchema,
} = require("./chat.validation");

router.post(
  "/conversations",
  validate(startConversationSchema),
  chatController.startConversation
);

router.post(
  "/conversations/:id/messages",
  validate(sendMessageSchema),
  chatController.sendMessage
);
router.post("/conversations", chatController.startConversation);
router.get("/conversations", chatController.getConversations);
router.get("/conversations/:id/messages", chatController.getConversationMessages);
// router.post("/conversations/:id/messages", chatController.sendMessage);
// router.patch("/conversations/:id/close", chatController.closeConversation);

module.exports = router;