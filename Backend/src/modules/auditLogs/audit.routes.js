const express = require("express");
const auditController = require("./audit.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", auditController.getAuditLogs);

module.exports = router;