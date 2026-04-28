const express = require("express");
const chatController = require("./chat.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/conversations", chatController.startConversation);
router.get("/conversations", chatController.getConversations);
router.get("/conversations/:id/messages", chatController.getConversationMessages);
router.post("/conversations/:id/messages", chatController.sendMessage);
router.patch("/conversations/:id/close", chatController.closeConversation);

module.exports = router;