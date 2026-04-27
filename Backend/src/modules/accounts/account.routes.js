const express = require("express");
const accountController = require("./account.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", accountController.getMyAccounts);
router.get("/:id", accountController.getAccountDetails);
router.get("/:id/balance", accountController.getAccountBalance);

module.exports = router;