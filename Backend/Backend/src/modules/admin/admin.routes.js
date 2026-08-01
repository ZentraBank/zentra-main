const express = require("express");
const adminController = require("./admin.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/dashboard", adminController.getDashboardStats);

module.exports = router;