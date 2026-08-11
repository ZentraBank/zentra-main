const express = require("express");
const transactionController = require("./transaction.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");


const router = express.Router();
const {
  transferSchema,
  adminCreditSchema,
  adminDebitSchema,
} = require("./transaction.validation");

router.post(
  "/transfer",
  validate(transferSchema),
  transactionController.transfer
);

router.post(
  "/admin-credit",
  validate(adminCreditSchema),
  transactionController.adminCredit
);

router.post(
  "/admin-debit",
  validate(adminDebitSchema),
  transactionController.adminDebit
);

router.use(authMiddleware);

router.get("/", transactionController.getAccountTransactions);
router.get("/:id", transactionController.getTransactionDetails);
// router.post("/transfer", transactionController.transfer);
// router.post("/admin-credit", transactionController.adminCredit);
// router.post("/admin-debit", transactionController.adminDebit);

module.exports = router;