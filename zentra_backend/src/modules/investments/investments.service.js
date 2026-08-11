const repo =
  require("./investments.repository");

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const createProduct = ({
  auth,
  body,
}) =>
  repo.createProduct({
    tenantId:
      auth.tenantId,

    createdBy:
      auth.userId,

    body,
  });

const listProducts = ({
  auth,
  query,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listProducts({
    tenantId:
      auth.tenantId,

    status:
      query.status || "active",

    limit,

    offset:
      (page - 1) * limit,
  });
};

const updateProduct =
  async ({
    auth,
    productId,
    body,
  }) => {
    const product =
      await repo.findProductById({
        tenantId:
          auth.tenantId,

        productId,
      });

    if (!product) {
      throw httpError(
        404,
        "Investment product not found"
      );
    }

    return repo.updateProduct({
      tenantId:
        auth.tenantId,

      productId,

      body,
    });
  };

const subscribe =
  async ({
    auth,
    body,
  }) => {
    const product =
      await repo.findProductById({
        tenantId:
          auth.tenantId,

        productId:
          body.productId,
      });

    if (
      !product ||
      product.status !== "active"
    ) {
      throw httpError(
        404,
        "Active investment product not found"
      );
    }

    const account =
      await repo.findAccountById({
        tenantId:
          auth.tenantId,

        accountId:
          body.sourceAccountId,
      });

    if (
      !account ||
      account.user_id !==
        auth.userId
    ) {
      throw httpError(
        404,
        "Source account not found"
      );
    }

    if (
      account.status !== "active"
    ) {
      throw httpError(
        403,
        "Source account is not active"
      );
    }

    if (
      account.currency !==
        product.currency
    ) {
      throw httpError(
        422,
        "Investment currency must match the source account"
      );
    }

    if (
      Number(body.amount) <
      Number(product.minimum_amount)
    ) {
      throw httpError(
        422,
        `Minimum investment amount is ${product.minimum_amount} ${product.currency}`
      );
    }

    if (
      product.maximum_amount &&
      Number(body.amount) >
      Number(product.maximum_amount)
    ) {
      throw httpError(
        422,
        `Maximum investment amount is ${product.maximum_amount} ${product.currency}`
      );
    }

    const principal =
      Number(body.amount);

    const annualRate =
      Number(product.annual_rate);

    const expectedReturn =
      principal *
      (annualRate / 100) *
      (Number(product.duration_days) / 365);

    const maturityAmount =
      principal +
      expectedReturn;

    const connection =
      await repo.db.getConnection();

    try {
      await connection.beginTransaction();

      const investmentId =
        await repo.createInvestment({
          connection,

          tenantId:
            auth.tenantId,

          userId:
            auth.userId,

          productId:
            product.id,

          sourceAccountId:
            account.id,

          principal:
            principal.toFixed(2),

          currency:
            product.currency,

          annualRate:
            product.annual_rate,

          durationDays:
            product.duration_days,

          expectedReturn:
            expectedReturn.toFixed(2),

          maturityAmount:
            maturityAmount.toFixed(2),
        });

      await repo.createEvent({
        connection,

        tenantId:
          auth.tenantId,

        investmentId,

        actorUserId:
          auth.userId,

        eventType:
          "investment_started",

        metadata: {
          principal:
            principal.toFixed(2),

          expectedReturn:
            expectedReturn.toFixed(2),

          maturityAmount:
            maturityAmount.toFixed(2),
        },
      });

      await connection.commit();

      return repo.findInvestmentById({
        tenantId:
          auth.tenantId,

        investmentId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

const listMine = ({
  auth,
  query,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listInvestments({
    tenantId:
      auth.tenantId,

    userId:
      auth.userId,

    status:
      query.status || null,

    adminView:
      false,

    limit,

    offset:
      (page - 1) * limit,
  });
};

const requestWithdrawal =
  async ({
    auth,
    investmentId,
    body,
  }) => {
    const investment =
      await repo.findInvestmentById({
        tenantId:
          auth.tenantId,

        investmentId,
      });

    if (
      !investment ||
      investment.user_id !==
        auth.userId
    ) {
      throw httpError(
        404,
        "Investment not found"
      );
    }

    if (
      investment.status !==
        "matured"
    ) {
      throw httpError(
        409,
        "Only matured investments can be withdrawn"
      );
    }

    const destination =
      await repo.findAccountById({
        tenantId:
          auth.tenantId,

        accountId:
          body.destinationAccountId,
      });

    if (
      !destination ||
      destination.user_id !==
        auth.userId
    ) {
      throw httpError(
        404,
        "Destination account not found"
      );
    }

    if (
      destination.currency !==
        investment.currency
    ) {
      throw httpError(
        422,
        "Destination account currency does not match the investment"
      );
    }

    const withdrawal =
      await repo.createWithdrawal({
        tenantId:
          auth.tenantId,

        investmentId,

        userId:
          auth.userId,

        destinationAccountId:
          destination.id,

        amount:
          investment.maturity_amount,

        currency:
          investment.currency,
      });

    await repo.createEvent({
      tenantId:
        auth.tenantId,

      investmentId,

      withdrawalId:
        withdrawal.id,

      actorUserId:
        auth.userId,

      eventType:
        "investment_withdrawal_requested",
    });

    return withdrawal;
  };

const listWithdrawals = ({
  auth,
  query,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listWithdrawals({
    tenantId:
      auth.tenantId,

    status:
      query.status,

    limit,

    offset:
      (page - 1) * limit,
  });
};

const reviewWithdrawal =
  async ({
    auth,
    withdrawalId,
    body,
  }) => {
    const withdrawal =
      await repo.findWithdrawalById({
        tenantId:
          auth.tenantId,

        withdrawalId,
      });

    if (!withdrawal) {
      throw httpError(
        404,
        "Investment withdrawal not found"
      );
    }

    if (
      withdrawal.status !==
        "pending"
    ) {
      throw httpError(
        409,
        `Withdrawal cannot be reviewed while status is ${withdrawal.status}`
      );
    }

    if (
      body.status === "rejected" &&
      !body.rejectionReason
    ) {
      throw httpError(
        422,
        "A rejection reason is required"
      );
    }

    const updated =
      await repo.reviewWithdrawal({
        tenantId:
          auth.tenantId,

        withdrawalId,

        reviewerId:
          auth.userId,

        status:
          body.status,

        rejectionReason:
          body.rejectionReason,
      });

    await repo.createEvent({
      tenantId:
        auth.tenantId,

      investmentId:
        withdrawal.investment_id,

      withdrawalId,

      actorUserId:
        auth.userId,

      eventType:
        `investment_withdrawal_${body.status}`,

      metadata: {
        rejectionReason:
          body.rejectionReason || null,
      },
    });

    return updated;
  };

const completeWithdrawal =
  async ({
    auth,
    withdrawalId,
  }) => {
    const connection =
      await repo.db.getConnection();

    try {
      await connection.beginTransaction();

      const withdrawal =
        await repo.findWithdrawalById({
          tenantId:
            auth.tenantId,

          withdrawalId,
        });

      if (!withdrawal) {
        throw httpError(
          404,
          "Investment withdrawal not found"
        );
      }

      if (
        withdrawal.status !==
          "approved"
      ) {
        throw httpError(
          409,
          "Withdrawal must be approved before completion"
        );
      }

      await repo.completeWithdrawal({
        connection,

        tenantId:
          auth.tenantId,

        withdrawalId,

        investmentId:
          withdrawal.investment_id,
      });

      await repo.createEvent({
        connection,

        tenantId:
          auth.tenantId,

        investmentId:
          withdrawal.investment_id,

        withdrawalId,

        actorUserId:
          auth.userId,

        eventType:
          "investment_withdrawal_completed",
      });

      await connection.commit();

      return {
        withdrawalId,
        status:
          "completed",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

const markMatured = ({
  auth,
}) =>
  repo.markMatured({
    tenantId:
      auth.tenantId,
  });

module.exports = {
  createProduct,
  listProducts,
  updateProduct,
  subscribe,
  listMine,
  requestWithdrawal,
  listWithdrawals,
  reviewWithdrawal,
  completeWithdrawal,
  markMatured,
};
