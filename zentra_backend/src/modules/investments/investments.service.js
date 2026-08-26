const repo =
  require(
    "./investments.repository"
  );

const notificationService =
  require(
    "../notifications/notifications.service"
  );

/*
|--------------------------------------------------------------------------
| Errors
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Notification helpers
|--------------------------------------------------------------------------
*/

const formatNotificationMoney =
  (
    amount,
    currency
  ) => {
    const numeric =
      Number(amount);

    try {
      return new Intl.NumberFormat(
        "en",
        {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ).format(
        Number.isFinite(numeric)
          ? numeric
          : 0
      );
    } catch {
      return `${currency} ${
        Number.isFinite(numeric)
          ? numeric.toFixed(2)
          : "0.00"
      }`;
    }
  };

const sendInvestmentNotification =
  async ({
    tenantId,
    userId,
    notificationType,
    title,
    message,
    actionUrl,
    metadata = null,
    priority = "normal",
  }) => {
    if (
      !tenantId ||
      !userId
    ) {
      return;
    }

    try {
      await notificationService.notifyUser({
        tenantId,
        userId,
        notificationType,
        title,
        message,
        priority,
        actionUrl,
        metadata,
      });
    } catch (error) {
      /*
       * Notifications must never
       * invalidate a completed
       * financial transaction.
       */
      console.error(
        `[Investments] Failed to send ${notificationType} notification:`,
        error.message
      );
    }
  };

const notifyTenantInvestmentManagers =
  async ({
    tenantId,
    notificationType,
    title,
    message,
    actionUrl,
    metadata = null,
    priority = "normal",
    excludeUserId = null,
  }) => {
    try {
      const managers =
        await repo.findTenantInvestmentManagers({
          tenantId,
        });

      for (
        const manager
        of managers
      ) {
        if (
          excludeUserId &&
          manager.user_id ===
            excludeUserId
        ) {
          continue;
        }

        await sendInvestmentNotification({
          tenantId,

          userId:
            manager.user_id,

          notificationType,
          title,
          message,
          actionUrl,
          metadata,
          priority,
        });
      }
    } catch (error) {
      console.error(
        "[Investments] Failed to notify tenant investment managers:",
        error.message
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Live investment growth
|--------------------------------------------------------------------------
*/

const enrichInvestment =
  (investment) => {
    if (!investment) {
      return investment;
    }

    const principal =
      Number(
        investment.principal
      );

    const expectedReturn =
      Number(
        investment.expected_return
      );

    const maturityAmount =
      Number(
        investment.maturity_amount
      );

    const startedAt =
      new Date(
        investment.started_at
      ).getTime();

    const maturityDate =
      new Date(
        investment.maturity_date
      ).getTime();

    const now =
      Date.now();

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(expectedReturn) ||
      !Number.isFinite(maturityAmount) ||
      !Number.isFinite(startedAt) ||
      !Number.isFinite(maturityDate)
    ) {
      return {
        ...investment,

        accrued_return:
          "0.00",

        current_value:
          investment.principal,

        growth_progress:
          0,

        days_remaining:
          0,

        growth: {
          startedAt:
            investment.started_at,

          maturityDate:
            investment.maturity_date,

          calculationType:
            "simple_interest",
        },
      };
    }

    const totalDuration =
      Math.max(
        maturityDate -
          startedAt,
        1
      );

    const elapsed =
      Math.max(
        0,
        Math.min(
          now -
            startedAt,
          totalDuration
        )
      );

    const progress =
      elapsed /
      totalDuration;

    const accruedReturn =
      expectedReturn *
      progress;

    const currentValue =
      Math.min(
        principal +
          accruedReturn,
        maturityAmount
      );

    const daysRemaining =
      Math.max(
        0,
        Math.ceil(
          (
            maturityDate -
            now
          ) /
            86400000
        )
      );

    return {
      ...investment,

      accrued_return:
        accruedReturn.toFixed(
          2
        ),

      current_value:
        currentValue.toFixed(
          2
        ),

      growth_progress:
        Number(
          (
            progress *
            100
          ).toFixed(
            4
          )
        ),

      days_remaining:
        daysRemaining,

      growth: {
        startedAt:
          investment.started_at,

        maturityDate:
          investment.maturity_date,

        calculationType:
          "simple_interest",
      },
    };
  };

/*
|--------------------------------------------------------------------------
| Investment products
|--------------------------------------------------------------------------
*/

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
  query = {},
}) => {
  const page =
    Number(
      query.page
    ) > 0
      ? Number(
          query.page
        )
      : 1;

  const limit =
    Number(
      query.pageSize
    ) > 0
      ? Math.min(
          Number(
            query.pageSize
          ),
          100
        )
      : 20;

  return repo.listProducts({
    tenantId:
      auth.tenantId,

    status:
      query.status ||
      "active",

    limit,

    offset:
      (
        page -
        1
      ) *
      limit,
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

/*
|--------------------------------------------------------------------------
| Shared investment creation
|--------------------------------------------------------------------------
*/

const createInvestmentForUser =
  async ({
    tenantId,
    userId,
    actorUserId,

    productId,
    sourceAccountId,
    amount,

    createdByTenant = false,
  }) => {
    const product =
      await repo.findProductById({
        tenantId,
        productId,
      });

    if (
      !product ||
      product.status !==
        "active"
    ) {
      throw httpError(
        404,
        "Active investment product not found"
      );
    }

    const account =
      await repo.findAccountById({
        tenantId,

        accountId:
          sourceAccountId,
      });

    if (
      !account ||
      account.user_id !==
        userId
    ) {
      throw httpError(
        404,
        "Source account not found for this client"
      );
    }

    if (
      account.status !==
      "active"
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

    const principal =
      Number(amount);

    if (
      !Number.isFinite(
        principal
      ) ||
      principal <= 0
    ) {
      throw httpError(
        422,
        "Investment amount must be greater than zero"
      );
    }

    const minimum =
      Number(
        product.minimum_amount
      );

    if (
      principal <
      minimum
    ) {
      throw httpError(
        422,
        `Minimum investment amount is ${product.minimum_amount} ${product.currency}`
      );
    }

    if (
      product.maximum_amount !==
        null &&
      product.maximum_amount !==
        undefined &&
      product.maximum_amount !==
        "" &&
      principal >
        Number(
          product.maximum_amount
        )
    ) {
      throw httpError(
        422,
        `Maximum investment amount is ${product.maximum_amount} ${product.currency}`
      );
    }

    const annualRate =
      Number(
        product.annual_rate
      );

    const durationDays =
      Number(
        product.duration_days
      );

    if (
      !Number.isFinite(
        annualRate
      ) ||
      annualRate < 0
    ) {
      throw httpError(
        422,
        "Investment product annual rate is invalid"
      );
    }

    if (
      !Number.isFinite(
        durationDays
      ) ||
      durationDays <= 0
    ) {
      throw httpError(
        422,
        "Investment product duration is invalid"
      );
    }

    /*
     * Simple interest:
     *
     * return =
     * principal × annual rate ×
     * duration / 365
     */
    const expectedReturn =
      principal *
      (
        annualRate /
        100
      ) *
      (
        durationDays /
        365
      );

    const maturityAmount =
      principal +
      expectedReturn;

    const connection =
      await repo.db.pool.getConnection();

    let investmentId;

    try {
      await connection.beginTransaction();

      const debited =
        await repo.debitAccount({
          connection,

          tenantId,

          accountId:
            account.id,

          amount:
            principal.toFixed(
              2
            ),
        });

      if (!debited) {
        throw httpError(
          422,
          "Insufficient funds or source account is unavailable"
        );
      }

      investmentId =
        await repo.createInvestment({
          connection,

          tenantId,
          userId,

          productId:
            product.id,

          sourceAccountId:
            account.id,

          principal:
            principal.toFixed(
              2
            ),

          currency:
            product.currency,

          annualRate:
            product.annual_rate,

          durationDays:
            product.duration_days,

          expectedReturn:
            expectedReturn.toFixed(
              2
            ),

          maturityAmount:
            maturityAmount.toFixed(
              2
            ),
        });

      await repo.createEvent({
        connection,

        tenantId,
        investmentId,

        actorUserId,

        eventType:
          createdByTenant
            ? "investment_created_by_tenant"
            : "investment_started",

        metadata: {
          clientUserId:
            userId,

          sourceAccountId:
            account.id,

          principal:
            principal.toFixed(
              2
            ),

          annualRate,

          durationDays,

          expectedReturn:
            expectedReturn.toFixed(
              2
            ),

          maturityAmount:
            maturityAmount.toFixed(
              2
            ),

          createdByTenant,
        },
      });

      await connection.commit();
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }

    /*
     * Financial transaction has
     * committed. Notifications
     * happen afterwards.
     */

    const investment =
      await repo.findInvestmentById({
        tenantId,
        investmentId,
      });

    const enriched =
      enrichInvestment(
        investment
      );

    /*
     * Client confirmation.
     */
    await sendInvestmentNotification({
      tenantId,

      userId,

      notificationType:
        "investment_created",

      title:
        createdByTenant
          ? "New Investment Created"
          : "Investment Started",

      message:
        createdByTenant
          ? `${product.name} has been created for you with an initial investment of ${formatNotificationMoney(
              principal,
              product.currency
            )}.`
          : `Your ${product.name} investment of ${formatNotificationMoney(
              principal,
              product.currency
            )} has started successfully.`,

      priority:
        "normal",

      actionUrl:
        `/investment/my-investments/${investmentId}`,

      metadata: {
        investmentId,

        productId:
          product.id,

        productName:
          product.name,

        principal:
          principal.toFixed(
            2
          ),

        currency:
          product.currency,

        annualRate,

        durationDays,

        expectedReturn:
          expectedReturn.toFixed(
            2
          ),

        maturityAmount:
          maturityAmount.toFixed(
            2
          ),

        createdByTenant,
      },
    });

    /*
     * Tenant investment managers
     * are notified as well.
     *
     * When the tenant created it,
     * exclude the person who just
     * performed the action.
     */
    await notifyTenantInvestmentManagers({
      tenantId,

      notificationType:
        createdByTenant
          ? "client_investment_created"
          : "client_investment_started",

      title:
        createdByTenant
          ? "Client Investment Created"
          : "Client Investment Started",

      message:
        createdByTenant
          ? `${product.name} was created for a client with ${formatNotificationMoney(
              principal,
              product.currency
            )}.`
          : `A client subscribed to ${product.name} with ${formatNotificationMoney(
              principal,
              product.currency
            )}.`,

      priority:
        "normal",

      actionUrl:
        `/dashboard/investments/client-investments/${investmentId}`,

      metadata: {
        investmentId,

        clientUserId:
          userId,

        productId:
          product.id,

        productName:
          product.name,

        principal:
          principal.toFixed(
            2
          ),

        currency:
          product.currency,

        createdByTenant,
      },

      excludeUserId:
        createdByTenant
          ? actorUserId
          : null,
    });

    return enriched;
  };

/*
|--------------------------------------------------------------------------
| Client subscribes
|--------------------------------------------------------------------------
*/

const subscribe =
  async ({
    auth,
    body,
  }) =>
    createInvestmentForUser({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,

      actorUserId:
        auth.userId,

      productId:
        body.productId,

      sourceAccountId:
        body.sourceAccountId,

      amount:
        body.amount,

      createdByTenant:
        false,
    });

/*
|--------------------------------------------------------------------------
| Tenant creates investment for client
|--------------------------------------------------------------------------
*/

const createClientInvestment =
  async ({
    auth,
    body,
  }) => {
    const client =
      await repo.findTenantClientByUserId({
        tenantId:
          auth.tenantId,

        userId:
          body.clientUserId,
      });

    if (!client) {
      throw httpError(
        404,
        "Client not found in this tenant"
      );
    }

    if (
      client.user_status !==
      "active"
    ) {
      throw httpError(
        409,
        "Client user account is not active"
      );
    }

    if (
      client.membership_status !==
      "active"
    ) {
      throw httpError(
        409,
        "Client tenant membership is not active"
      );
    }

    return createInvestmentForUser({
      tenantId:
        auth.tenantId,

      userId:
        client.id,

      actorUserId:
        auth.userId,

      productId:
        body.productId,

      sourceAccountId:
        body.sourceAccountId,

      amount:
        body.amount,

      createdByTenant:
        true,
    });
  };

/*
|--------------------------------------------------------------------------
| Client investments
|--------------------------------------------------------------------------
*/

const listMine =
  async ({
    auth,
    query = {},
  }) => {
    const page =
      Number(
        query.page
      ) > 0
        ? Number(
            query.page
          )
        : 1;

    const limit =
      Number(
        query.pageSize
      ) > 0
        ? Math.min(
            Number(
              query.pageSize
            ),
            100
          )
        : 20;

    const investments =
      await repo.listInvestments({
        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        status:
          query.status ||
          null,

        adminView:
          false,

        limit,

        offset:
          (
            page -
            1
          ) *
          limit,
      });

    return investments.map(
      enrichInvestment
    );
  };

/*
|--------------------------------------------------------------------------
| Tenant investment list
|--------------------------------------------------------------------------
*/

const listAll =
  async ({
    auth,
    query = {},
  }) => {
    const page =
      Number(
        query.page
      ) > 0
        ? Number(
            query.page
          )
        : 1;

    const limit =
      Number(
        query.pageSize
      ) > 0
        ? Math.min(
            Number(
              query.pageSize
            ),
            100
          )
        : 20;

    const investments =
      await repo.listInvestments({
        tenantId:
          auth.tenantId,

        userId:
          null,

        status:
          query.status ||
          null,

        adminView:
          true,

        limit,

        offset:
          (
            page -
            1
          ) *
          limit,
      });

    return investments.map(
      enrichInvestment
    );
  };

/*
|--------------------------------------------------------------------------
| Client requests withdrawal
|--------------------------------------------------------------------------
*/

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
      destination.status !==
      "active"
    ) {
      throw httpError(
        403,
        "Destination account is not active"
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

      metadata: {
        destinationAccountId:
          destination.id,

        amount:
          investment.maturity_amount,
      },
    });

    /*
     * Client confirmation.
     */
    await sendInvestmentNotification({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,

      notificationType:
        "investment_withdrawal_requested",

      title:
        "Withdrawal Request Submitted",

      message:
        `Your withdrawal request for ${formatNotificationMoney(
          investment.maturity_amount,
          investment.currency
        )} has been submitted for review.`,

      priority:
        "normal",

      actionUrl:
        `/investment/my-investments/${investment.id}`,

      metadata: {
        investmentId,

        withdrawalId:
          withdrawal.id,

        destinationAccountId:
          destination.id,

        amount:
          investment.maturity_amount,

        currency:
          investment.currency,
      },
    });

    /*
     * Tenant reviewers.
     */
    await notifyTenantInvestmentManagers({
      tenantId:
        auth.tenantId,

      notificationType:
        "investment_withdrawal_requested",

      title:
        "Investment Withdrawal Requested",

      message:
        `A client has requested withdrawal of ${formatNotificationMoney(
          investment.maturity_amount,
          investment.currency
        )}.`,

      priority:
        "high",

      actionUrl:
        "/dashboard/investments/withdrawals",

      metadata: {
        investmentId,

        withdrawalId:
          withdrawal.id,

        clientUserId:
          auth.userId,

        destinationAccountId:
          destination.id,

        amount:
          investment.maturity_amount,

        currency:
          investment.currency,
      },
    });

    return withdrawal;
  };

/*
|--------------------------------------------------------------------------
| Tenant withdrawal list
|--------------------------------------------------------------------------
*/

const listWithdrawals = ({
  auth,
  query = {},
}) => {
  const page =
    Number(
      query.page
    ) > 0
      ? Number(
          query.page
        )
      : 1;

  const limit =
    Number(
      query.pageSize
    ) > 0
      ? Math.min(
          Number(
            query.pageSize
          ),
          100
        )
      : 20;

  return repo.listWithdrawals({
    tenantId:
      auth.tenantId,

    status:
      query.status ||
      "pending",

    limit,

    offset:
      (
        page -
        1
      ) *
      limit,
  });
};

/*
|--------------------------------------------------------------------------
| Tenant reviews withdrawal
|--------------------------------------------------------------------------
*/

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
      body.status ===
        "rejected" &&
      !body.rejectionReason
        ?.trim()
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
          body.status ===
          "rejected"
            ? body.rejectionReason.trim()
            : null,
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
          body.status ===
          "rejected"
            ? body.rejectionReason.trim()
            : null,
      },
    });

    if (
      body.status ===
      "approved"
    ) {
      await sendInvestmentNotification({
        tenantId:
          auth.tenantId,

        userId:
          withdrawal.user_id,

        notificationType:
          "investment_withdrawal_approved",

        title:
          "Withdrawal Approved",

        message:
          `Your investment withdrawal of ${formatNotificationMoney(
            withdrawal.amount,
            withdrawal.currency
          )} has been approved and is awaiting completion.`,

        priority:
          "high",

        actionUrl:
          `/investment/my-investments/${withdrawal.investment_id}`,

        metadata: {
          investmentId:
            withdrawal.investment_id,

          withdrawalId,

          amount:
            withdrawal.amount,

          currency:
            withdrawal.currency,
        },
      });

      await notifyTenantInvestmentManagers({
        tenantId:
          auth.tenantId,

        notificationType:
          "investment_withdrawal_approved",

        title:
          "Investment Withdrawal Approved",

        message:
          `A withdrawal of ${formatNotificationMoney(
            withdrawal.amount,
            withdrawal.currency
          )} has been approved and is awaiting completion.`,

        priority:
          "normal",

        actionUrl:
          "/dashboard/investments/withdrawals",

        metadata: {
          investmentId:
            withdrawal.investment_id,

          withdrawalId,

          clientUserId:
            withdrawal.user_id,

          amount:
            withdrawal.amount,

          currency:
            withdrawal.currency,
        },

        excludeUserId:
          auth.userId,
      });
    }

    if (
      body.status ===
      "rejected"
    ) {
      const reason =
        body.rejectionReason
          .trim();

      await sendInvestmentNotification({
        tenantId:
          auth.tenantId,

        userId:
          withdrawal.user_id,

        notificationType:
          "investment_withdrawal_rejected",

        title:
          "Withdrawal Rejected",

        message:
          `Your investment withdrawal was rejected. Reason: ${reason}`,

        priority:
          "high",

        actionUrl:
          `/investment/my-investments/${withdrawal.investment_id}`,

        metadata: {
          investmentId:
            withdrawal.investment_id,

          withdrawalId,

          rejectionReason:
            reason,

          amount:
            withdrawal.amount,

          currency:
            withdrawal.currency,
        },
      });

      await notifyTenantInvestmentManagers({
        tenantId:
          auth.tenantId,

        notificationType:
          "investment_withdrawal_rejected",

        title:
          "Investment Withdrawal Rejected",

        message:
          `A withdrawal of ${formatNotificationMoney(
            withdrawal.amount,
            withdrawal.currency
          )} has been rejected.`,

        priority:
          "normal",

        actionUrl:
          "/dashboard/investments/withdrawals",

        metadata: {
          investmentId:
            withdrawal.investment_id,

          withdrawalId,

          clientUserId:
            withdrawal.user_id,

          rejectionReason:
            reason,

          amount:
            withdrawal.amount,

          currency:
            withdrawal.currency,
        },

        excludeUserId:
          auth.userId,
      });
    }

    return updated;
  };

/*
|--------------------------------------------------------------------------
| Complete withdrawal
|--------------------------------------------------------------------------
*/

const completeWithdrawal =
  async ({
    auth,
    withdrawalId,
  }) => {
    const connection =
      await repo.db.pool.getConnection();

    let withdrawal;

    try {
      await connection.beginTransaction();

      withdrawal =
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

      const investment =
        await repo.findInvestmentById({
          tenantId:
            auth.tenantId,

          investmentId:
            withdrawal.investment_id,
        });

      if (!investment) {
        throw httpError(
          404,
          "Investment not found"
        );
      }

      const destination =
        await repo.findAccountById({
          tenantId:
            auth.tenantId,

          accountId:
            withdrawal.destination_account_id,
        });

      if (!destination) {
        throw httpError(
          404,
          "Withdrawal destination account not found"
        );
      }

      if (
        destination.user_id !==
        withdrawal.user_id
      ) {
        throw httpError(
          409,
          "Withdrawal destination account does not belong to the client"
        );
      }

      if (
        destination.status !==
        "active"
      ) {
        throw httpError(
          409,
          "Withdrawal destination account is not active"
        );
      }

      if (
        destination.currency !==
        withdrawal.currency
      ) {
        throw httpError(
          422,
          "Withdrawal destination account currency does not match"
        );
      }

      const credited =
        await repo.creditAccount({
          connection,

          tenantId:
            auth.tenantId,

          accountId:
            withdrawal.destination_account_id,

          amount:
            withdrawal.amount,
        });

      if (!credited) {
        throw httpError(
          409,
          "Unable to credit the withdrawal destination account"
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

        metadata: {
          amount:
            withdrawal.amount,

          destinationAccountId:
            withdrawal.destination_account_id,
        },
      });

      await connection.commit();
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }

    /*
     * Client notification.
     */
    await sendInvestmentNotification({
      tenantId:
        auth.tenantId,

      userId:
        withdrawal.user_id,

      notificationType:
        "investment_withdrawal_completed",

      title:
        "Investment Funds Credited",

      message:
        `${formatNotificationMoney(
          withdrawal.amount,
          withdrawal.currency
        )} from your matured investment has been credited to your selected account.`,

      priority:
        "high",

      actionUrl:
        `/investment/my-investments/${withdrawal.investment_id}`,

      metadata: {
        investmentId:
          withdrawal.investment_id,

        withdrawalId,

        destinationAccountId:
          withdrawal.destination_account_id,

        amount:
          withdrawal.amount,

        currency:
          withdrawal.currency,

        completed:
          true,
      },
    });

    /*
     * Other tenant managers.
     */
    await notifyTenantInvestmentManagers({
      tenantId:
        auth.tenantId,

      notificationType:
        "investment_withdrawal_completed",

      title:
        "Investment Withdrawal Completed",

      message:
        `${formatNotificationMoney(
          withdrawal.amount,
          withdrawal.currency
        )} has been credited to a client's destination account.`,

      priority:
        "normal",

      actionUrl:
        `/dashboard/investments/client-investments/${withdrawal.investment_id}`,

      metadata: {
        investmentId:
          withdrawal.investment_id,

        withdrawalId,

        clientUserId:
          withdrawal.user_id,

        destinationAccountId:
          withdrawal.destination_account_id,

        amount:
          withdrawal.amount,

        currency:
          withdrawal.currency,
      },

      excludeUserId:
        auth.userId,
    });

    return {
      withdrawalId,

      investmentId:
        withdrawal.investment_id,

      amount:
        withdrawal.amount,

      currency:
        withdrawal.currency,

      destinationAccountId:
        withdrawal.destination_account_id,

      status:
        "completed",
    };
  };

/*
|--------------------------------------------------------------------------
| Manual maturity check
|--------------------------------------------------------------------------
*/

const markMatured =
  async ({
    auth,
  }) => {
    const due =
      await repo.findDueInvestmentsByTenant({
        tenantId:
          auth.tenantId,
      });

    let updatedCount =
      0;

    for (
      const investment
      of due
    ) {
      const connection =
        await repo.db.pool.getConnection();

      let committed =
        false;

      try {
        await connection.beginTransaction();

        const updated =
          await repo.markInvestmentMatured({
            connection,

            tenantId:
              auth.tenantId,

            investmentId:
              investment.id,
          });

        if (!updated) {
          await connection.rollback();

          continue;
        }

        await repo.createEvent({
          connection,

          tenantId:
            auth.tenantId,

          investmentId:
            investment.id,

          actorUserId:
            auth.userId,

          eventType:
            "investment_matured",

          metadata: {
            maturedAutomatically:
              false,

            maturityDate:
              investment.maturity_date,

            principal:
              investment.principal,

            maturityAmount:
              investment.maturity_amount,

            currency:
              investment.currency,
          },
        });

        await connection.commit();

        committed =
          true;

        updatedCount +=
          1;
      } catch (error) {
        if (!committed) {
          await connection.rollback();
        }

        throw error;
      } finally {
        connection.release();
      }

      /*
       * Notify after commit.
       */

      await sendInvestmentNotification({
        tenantId:
          investment.tenant_id,

        userId:
          investment.user_id,

        notificationType:
          "investment_matured",

        title:
          "Investment Matured",

        message:
          `Your investment has matured at ${formatNotificationMoney(
            investment.maturity_amount,
            investment.currency
          )}. You can now request a withdrawal.`,

        priority:
          "high",

        actionUrl:
          `/investment/my-investments/${investment.id}`,

        metadata: {
          investmentId:
            investment.id,

          productId:
            investment.product_id,

          principal:
            investment.principal,

          maturityAmount:
            investment.maturity_amount,

          currency:
            investment.currency,

          maturityDate:
            investment.maturity_date,

          maturedAutomatically:
            false,
        },
      });

      await notifyTenantInvestmentManagers({
        tenantId:
          investment.tenant_id,

        notificationType:
          "client_investment_matured",

        title:
          "Client Investment Matured",

        message:
          `A client investment has matured at ${formatNotificationMoney(
            investment.maturity_amount,
            investment.currency
          )}.`,

        priority:
          "normal",

        actionUrl:
          `/dashboard/investments/client-investments/${investment.id}`,

        metadata: {
          investmentId:
            investment.id,

          clientUserId:
            investment.user_id,

          productId:
            investment.product_id,

          maturityAmount:
            investment.maturity_amount,

          currency:
            investment.currency,

          maturedAutomatically:
            false,
        },

        excludeUserId:
          auth.userId,
      });
    }

    return updatedCount;
  };

/*
|--------------------------------------------------------------------------
| Automatic maturity check
|--------------------------------------------------------------------------
*/

const markAllMatured =
  async () => {
    const investments =
      await repo.findDueInvestments();

    let updatedCount =
      0;

    for (
      const investment
      of investments
    ) {
      const connection =
        await repo.db.pool.getConnection();

      let committed =
        false;

      try {
        await connection.beginTransaction();

        const updated =
          await repo.markInvestmentMatured({
            connection,

            tenantId:
              investment.tenant_id,

            investmentId:
              investment.id,
          });

        if (!updated) {
          await connection.rollback();

          continue;
        }

        await repo.createEvent({
          connection,

          tenantId:
            investment.tenant_id,

          investmentId:
            investment.id,

          actorUserId:
            null,

          eventType:
            "investment_matured",

          metadata: {
            maturedAutomatically:
              true,

            maturityDate:
              investment.maturity_date,

            principal:
              investment.principal,

            maturityAmount:
              investment.maturity_amount,

            currency:
              investment.currency,
          },
        });

        await connection.commit();

        committed =
          true;

        updatedCount +=
          1;
      } catch (error) {
        if (!committed) {
          await connection.rollback();
        }

        console.error(
          `[Investments] Failed to mature investment ${investment.id}:`,
          error
        );

        continue;
      } finally {
        connection.release();
      }

      /*
       * Client notification.
       */

      await sendInvestmentNotification({
        tenantId:
          investment.tenant_id,

        userId:
          investment.user_id,

        notificationType:
          "investment_matured",

        title:
          "Investment Matured",

        message:
          `Your investment has matured at ${formatNotificationMoney(
            investment.maturity_amount,
            investment.currency
          )}. You can now request a withdrawal.`,

        priority:
          "high",

        actionUrl:
          `/investment/my-investments/${investment.id}`,

        metadata: {
          investmentId:
            investment.id,

          productId:
            investment.product_id,

          principal:
            investment.principal,

          maturityAmount:
            investment.maturity_amount,

          currency:
            investment.currency,

          maturityDate:
            investment.maturity_date,

          maturedAutomatically:
            true,
        },
      });

      /*
       * Tenant notification.
       */

      await notifyTenantInvestmentManagers({
        tenantId:
          investment.tenant_id,

        notificationType:
          "client_investment_matured",

        title:
          "Client Investment Matured",

        message:
          `A client investment has automatically matured at ${formatNotificationMoney(
            investment.maturity_amount,
            investment.currency
          )}.`,

        priority:
          "normal",

        actionUrl:
          `/dashboard/investments/client-investments/${investment.id}`,

        metadata: {
          investmentId:
            investment.id,

          clientUserId:
            investment.user_id,

          productId:
            investment.product_id,

          maturityAmount:
            investment.maturity_amount,

          currency:
            investment.currency,

          maturedAutomatically:
            true,
        },
      });
    }

    return updatedCount;
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  createProduct,
  listProducts,
  updateProduct,

  subscribe,
  createClientInvestment,

  listMine,
  listAll,

  requestWithdrawal,

  listWithdrawals,
  reviewWithdrawal,
  completeWithdrawal,

  markMatured,
  markAllMatured,

  enrichInvestment,
};