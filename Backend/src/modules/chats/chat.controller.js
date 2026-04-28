const transactionService = require("./transaction.service");
const { getPagination, cleanFilters } = require("../../utils/query");
const { emitToUser } = require("../../utils/socket");

function emitTransactionNotifications(req, result) {
  if (!result || !result.notifications) return;

  result.notifications.forEach((notification) => {
    emitToUser(
      req,
      notification.tenant_id,
      notification.user_id,
      "notification:new",
      notification
    );
  });
}

async function getAccountTransactions(req, res, next) {
  try {
    const { limit, page, offset } = getPagination(req.query);
    const filters = cleanFilters(req.query, ["type", "status"]);

    const transactions = await transactionService.getAccountTransactions({
      accountId: req.query.account_id,
      tenantId: req.tenant.id,
      user: req.user,
      limit,
      offset,
      filters,
    });

    return res.json({
      success: true,
      meta: {
        page,
        limit,
        filters,
      },
      data: { transactions },
    });
  } catch (error) {
    next(error);
  }
}

async function getTransactionDetails(req, res, next) {
  try {
    const transaction = await transactionService.getTransactionDetails({
      transactionId: req.params.id,
      tenantId: req.tenant.id,
      user: req.user,
    });

    return res.json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
}

async function transfer(req, res, next) {
  try {
    const result = await transactionService.transfer({
      tenantId: req.tenant.id,
      user: req.user,
      ...req.body,
    });

    emitTransactionNotifications(req, result);

    return res.status(201).json({
      success: true,
      message: "Transfer successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function adminCredit(req, res, next) {
  try {
    const result = await transactionService.adminCredit({
      tenantId: req.tenant.id,
      user: req.user,
      ...req.body,
    });

    emitTransactionNotifications(req, result);

    return res.status(201).json({
      success: true,
      message: "Account credited successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function adminDebit(req, res, next) {
  try {
    const result = await transactionService.adminDebit({
      tenantId: req.tenant.id,
      user: req.user,
      ...req.body,
    });

    emitTransactionNotifications(req, result);

    return res.status(201).json({
      success: true,
      message: "Account debited successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAccountTransactions,
  getTransactionDetails,
  transfer,
  adminCredit,
  adminDebit,
};