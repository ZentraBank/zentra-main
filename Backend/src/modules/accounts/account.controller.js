const accountService = require("./account.service");

async function getMyAccounts(req, res, next) {
  try {
    const accounts = await accountService.getMyAccounts(
      req.user.id,
      req.tenant.id
    );

    return res.json({
      success: true,
      data: { accounts },
    });
  } catch (error) {
    next(error);
  }
}

async function getAccountDetails(req, res, next) {
  try {
    const account = await accountService.getAccountDetails(
      req.params.id,
      req.tenant.id,
      req.user
    );

    return res.json({
      success: true,
      data: { account },
    });
  } catch (error) {
    next(error);
  }
}

async function getAccountBalance(req, res, next) {
  try {
    const balance = await accountService.getAccountBalance(
      req.params.id,
      req.tenant.id,
      req.user
    );

    return res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyAccounts,
  getAccountDetails,
  getAccountBalance,
};