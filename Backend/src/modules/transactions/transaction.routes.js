const express = require("express");
const transactionController = require("./transaction.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", transactionController.getAccountTransactions);
router.get("/:id", transactionController.getTransactionDetails);
router.post("/transfer", transactionController.transfer);
router.post("/admin-credit", transactionController.adminCredit);
router.post("/admin-debit", transactionController.adminDebit);

module.exports = router;