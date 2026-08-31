const crypto = require("crypto");
const db = require("../../config/db");
const repo = require("./transfers.repository");
const subscriptionService = require(
  "../subscriptions/subscriptions.service"
);
const tenantRepo = require(
  "../tenants/tenant.repository"
);

const transactionPinService = require(
  "../transaction-pin/transaction-pin.service"
);

const fxRepo = require(
  "../fx/fx.repository"
);

const notifications = require(
  "../notifications/notifications.repository"
);

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getTransferEntitlements = async ({
  tenantId,
}) => {
  const {
    subscription,
    entitlements,
  } =
    await subscriptionService.getTenantEntitlements({
      tenantId,
    });

  if (!subscription) {
    throw httpError(
      403,
      "An active subscription is required"
    );
  }

  return {
    subscription,
    entitlements,
  };
};

const getPlanLimit = ({
  entitlements,
  featureKey,
}) => {
  if (
    !Object.prototype.hasOwnProperty.call(
      entitlements,
      featureKey
    )
  ) {
    throw httpError(
      500,
      `Subscription feature ${featureKey} is not configured`
    );
  }

  const value =
    entitlements[featureKey];

  /*
   * null means unlimited by subscription.
   */
  if (value === null) {
    return null;
  }

  if (value === false) {
    throw httpError(
      403,
      `Your current subscription does not include ${featureKey}`
    );
  }

  const limit = Number(value);

  if (
    !Number.isFinite(limit) ||
    limit < 0
  ) {
    throw httpError(
      500,
      `Invalid ${featureKey} subscription configuration`
    );
  }

  return limit;
};

// const featureNumber = (auth, key) => {
//   const feature = auth.planFeatures?.[key];
//   const value = Number(feature?.value);

//   if (
//     !feature?.enabled ||
//     !Number.isFinite(value)
//   ) {
//     throw httpError(
//       403,
//       `Your current plan does not include ${key}`
//     );
//   }

//   return value;
// };

// const getTransferLimits = (auth) => {
//   const defaultTransferLimit = 10000;
//   const defaultDailyTransferLimit = 25000;

//   if (
//     !auth.subscriptionId ||
//     !auth.planId
//   ) {
//     return {
//       transferLimit:
//         defaultTransferLimit,

//       dailyTransferLimit:
//         defaultDailyTransferLimit,
//     };
//   }

//   return {
//     transferLimit:
//       featureNumber(
//         auth,
//         "transfer_limit"
//       ),

//     dailyTransferLimit:
//       featureNumber(
//         auth,
//         "daily_transfer_limit"
//       ),
//   };
// };

const makeReference = () =>
  `ZTR-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

/*
|--------------------------------------------------------------------------
| Client transfer services
|--------------------------------------------------------------------------
*/

const createInternalTransfer = async ({
  auth,
  body,
}) => {
  const amount =
    Number(body.amount);

  const transferType =
    body.transferType ||
    "internal";

    const destinationCountryCode =
  transferType === "external"
    ? body.destinationCountryCode
        ?.trim()
        .toUpperCase()
    : sourceCountryCode;

const isInternational =
  transferType === "external" &&
  destinationCountryCode !==
    sourceCountryCode;

if (
  isInternational &&
  entitlements.international_transfers !==
    true
) {
  throw httpError(
    403,
    "International transfers are not included in your current subscription plan"
  );
}



  /*
  |--------------------------------------------------------------------------
  | Basic validation
  |--------------------------------------------------------------------------
  */

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw httpError(
      400,
      "Transfer amount must be greater than zero"
    );
  }

  const {
  entitlements,
} =
  await getTransferEntitlements({
    tenantId: auth.tenantId,
  });

const transferLimit =
  getPlanLimit({
    entitlements,
    featureKey:
      "transfer_limit",
  });

const dailyTransferLimit =
  getPlanLimit({
    entitlements,
    featureKey:
      "daily_transfer_limit",
  });

const tenant =
  await tenantRepo.findTenantById(
    auth.tenantId
  );

if (!tenant) {
  throw httpError(
    404,
    "Tenant not found"
  );
}

if (!tenant.country_code) {
  throw httpError(
    500,
    "Tenant country is not configured"
  );
}

const sourceCountryCode =
  tenant.country_code
    .trim()
    .toUpperCase();

  /*
  |--------------------------------------------------------------------------
  | Verify transaction PIN
  |--------------------------------------------------------------------------
  */

  await transactionPinService.verify({
    userId:
      auth.userId,

    pin:
      body.transactionPin,
  });

  /*
  |--------------------------------------------------------------------------
  | Transfer limits
  |--------------------------------------------------------------------------
  */

  if (
  transferLimit !== null &&
  amount > transferLimit
) {
  throw httpError(
    403,
    `Your current subscription plan allows a maximum transfer of ${transferLimit}`
  );
}

  const dailyTotal =
    Number(
      await repo.getDailyCompletedTotal({
        userId:
          auth.userId,

        tenantId:
          auth.tenantId,
      })
    ) || 0;

  if (
  dailyTransferLimit !== null &&
  dailyTotal + amount >
    dailyTransferLimit
) {
    throw httpError(
  403,
  `Your current subscription plan allows a maximum daily transfer total of ${dailyTransferLimit}`
);
  }

  /*
  |--------------------------------------------------------------------------
  | External transfers
  |--------------------------------------------------------------------------
  */

  if (
    transferType ===
      "external" &&
    (
      process.env.PAYMENT_MODE ||
      "simulation"
    ) !== "simulation"
  ) {
    throw httpError(
      503,
      "External payment providers are not configured"
    );
  }

  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Source account
    |--------------------------------------------------------------------------
    */

    const source =
      await repo.findAccountForUpdate({
        connection,

        accountId:
          body.sourceAccountId,

        tenantId:
          auth.tenantId,
      });

    if (
      !source ||
      source.user_id !==
        auth.userId
    ) {
      throw httpError(
        404,
        "Source account not found"
      );
    }

    if (
      source.status !==
      "active"
    ) {
      throw httpError(
        403,
        "The source account must be active"
      );
    }

    if (
      source.currency !==
      body.currency
    ) {
      throw httpError(
        400,
        "Account currency does not match transfer currency"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Destination account
    |--------------------------------------------------------------------------
    */

    let destination = null;

    let destinationAmount =
      amount;

    let appliedFxRate =
      null;

    let appliedFxRateId =
      null;

    if (
      transferType ===
      "internal"
    ) {
      destination =
        await repo.findAccountByNumberForUpdate({
          connection,

          accountNumber:
            body.destinationAccountNumber,

          tenantId:
            auth.tenantId,
        });

      if (!destination) {
        throw httpError(
          404,
          "Destination account not found"
        );
      }

      if (
        source.id ===
        destination.id
      ) {
        throw httpError(
          400,
          "Source and destination accounts cannot be the same"
        );
      }

      if (
        destination.status !==
        "active"
      ) {
        throw httpError(
          403,
          "The destination account must be active"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Currency conversion
      |--------------------------------------------------------------------------
      */

      const requiresFx =
        destination.currency !==
        source.currency;

      if (requiresFx) {
        if (
  entitlements.fx_access !== true
) {
  throw httpError(
    403,
    "Foreign exchange transfers are not included in your current subscription plan"
  );
}
        if (
          !body.fxRateId ||
          body.fxRate ===
            undefined ||
          body.fxRate ===
            null
        ) {
          throw httpError(
            400,
            `An exchange rate is required to transfer from ${source.currency} to ${destination.currency}`
          );
        }

        const submittedRate =
          Number(body.fxRate);

        if (
          !Number.isFinite(
            submittedRate
          ) ||
          submittedRate <= 0
        ) {
          throw httpError(
            400,
            "The submitted exchange rate is invalid"
          );
        }

        /*
         * Never trust the rate sent
         * by the frontend.
         *
         * Retrieve the tenant's
         * actual rate again.
         */

        const rateRecord =
          await fxRepo.findRateById({
            tenantId:
              auth.tenantId,

            rateId:
              body.fxRateId,
          });

        if (!rateRecord) {
          throw httpError(
            404,
            "Exchange rate not found"
          );
        }

        if (
          rateRecord.status !==
          "active"
        ) {
          throw httpError(
            409,
            "This exchange rate is no longer active"
          );
        }

        /*
         * Optional expiry protection.
         */

        if (
          rateRecord.expires_at &&
          new Date(
            rateRecord.expires_at
          ) <= new Date()
        ) {
          throw httpError(
            409,
            "This exchange rate is no longer available"
          );
        }

        let currentRate;

        /*
         * Direct rate:
         *
         * GBP -> USD
         * 1 GBP = 1.35 USD
         */

        if (
          rateRecord.base_currency ===
            source.currency &&
          rateRecord.quote_currency ===
            destination.currency
        ) {
          currentRate =
            Number(
              rateRecord.mid_rate
            );
        }

        /*
         * Inverse rate:
         *
         * Stored:
         * GBP -> USD = 1.35
         *
         * Requested:
         * USD -> GBP
         */

        else if (
          rateRecord.base_currency ===
            destination.currency &&
          rateRecord.quote_currency ===
            source.currency
        ) {
          const storedRate =
            Number(
              rateRecord.mid_rate
            );

          if (
            !Number.isFinite(
              storedRate
            ) ||
            storedRate <= 0
          ) {
            throw httpError(
              500,
              "Stored exchange rate is invalid"
            );
          }

          currentRate =
            1 / storedRate;
        }

        /*
         * Wrong currency pair.
         */

        else {
          throw httpError(
            400,
            "Exchange rate does not match the selected currencies"
          );
        }

        if (
          !Number.isFinite(
            currentRate
          ) ||
          currentRate <= 0
        ) {
          throw httpError(
            500,
            "Exchange rate is invalid"
          );
        }

        /*
         * The customer must confirm
         * the same rate they saw.
         */

        const tolerance =
          0.00000001;

        if (
          Math.abs(
            currentRate -
              submittedRate
          ) > tolerance
        ) {
          throw httpError(
            409,
            "The exchange rate has changed. Please review the latest rate before continuing"
          );
        }

        appliedFxRate =
          currentRate;

        appliedFxRateId =
          rateRecord.id;

        /*
         * Destination receives
         * converted amount.
         */

        destinationAmount =
          Math.round(
            amount *
              appliedFxRate *
              100
          ) / 100;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Debit source account
    |--------------------------------------------------------------------------
    */

    const debited =
      await repo.debitAccount({
        connection,

        accountId:
          source.id,

        tenantId:
          auth.tenantId,

        amount,
      });

    if (!debited) {
      throw httpError(
        400,
        "Insufficient balance or inactive source account"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Credit internal destination
    |--------------------------------------------------------------------------
    */

    if (destination) {
      const credited =
        await repo.creditAccount({
          connection,

          accountId:
            destination.id,

          tenantId:
            auth.tenantId,

          amount:
            destinationAmount,
        });

      if (!credited) {
        throw httpError(
          400,
          "Unable to credit destination account"
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Create transfer
    |--------------------------------------------------------------------------
    */

    const reference =
      makeReference();

    const transferId =
      await repo.createTransfer({
        connection,

        tenantId:
          auth.tenantId,

        userId:
          auth.userId,

        sourceAccountId:
          source.id,

        destinationAccountId:
          destination?.id ||
          null,

        destinationAccountNumber:
          body.destinationAccountNumber,

        transferType,

        destinationAccountName:
          destination?.account_name ||
          body.destinationAccountName ||
          null,

        destinationBankName:
          destination
            ? "ZentraBank"
            : body.destinationBankName,

        destinationBankCode:
          destination
            ? "ZENTRA"
            : body.destinationBankCode,

        settlementMode:
          destination
            ? "internal"
            : "simulation",

        isSimulated:
          !destination,

        /*
         * Transfer amount is the
         * amount removed from the
         * sender's account.
         */

        amount,

        currency:
          source.currency,

        description:
          body.description ||
          null,

        status:
          "completed",

        reference,
      });

    /*
    |--------------------------------------------------------------------------
    | Sender ledger entry
    |--------------------------------------------------------------------------
    */

    await repo.createLedgerEntry({
      connection,

      tenantId:
        auth.tenantId,

      accountId:
        source.id,

      transferId,

      entryType:
        "debit",

      amount,

      balanceAfter:
        Number(
          source.balance
        ) - amount,

      description:
        body.description ||
        (
          appliedFxRate
            ? `FX transfer debit to ${destination.currency}`
            : transferType ===
                "external"
              ? "Simulated external transfer debit"
              : "Internal transfer debit"
        ),
    });

    /*
    |--------------------------------------------------------------------------
    | Destination ledger entry
    |--------------------------------------------------------------------------
    */

    if (destination) {
      await repo.createLedgerEntry({
        connection,

        tenantId:
          auth.tenantId,

        accountId:
          destination.id,

        transferId,

        entryType:
          "credit",

        amount:
          destinationAmount,

        balanceAfter:
          Number(
            destination.balance
          ) +
          destinationAmount,

        description:
          body.description ||
          (
            appliedFxRate
              ? `FX transfer credit from ${source.currency}`
              : "Internal transfer credit"
          ),
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Sender notification
    |--------------------------------------------------------------------------
    */

    await notifications.create({
      connection,

      tenantId:
        auth.tenantId,

      userId:
        auth.userId,

      notificationType:
        "transfer_sent",

      title:
        appliedFxRate
          ? "Currency transfer completed"
          : transferType ===
              "external"
            ? "Demo transfer completed"
            : "Transfer completed",

      message:
        appliedFxRate &&
        destination
          ? `${amount.toFixed(
              2
            )} ${
              source.currency
            } was converted at 1 ${
              source.currency
            } = ${appliedFxRate.toFixed(
              6
            )} ${
              destination.currency
            }. ${destinationAmount.toFixed(
              2
            )} ${
              destination.currency
            } was transferred to ${
              destination.account_name
            }.`
          : `${amount.toFixed(
              2
            )} ${
              source.currency
            } was sent to ${
              destination?.account_name ||
              body.destinationAccountName ||
              body.destinationAccountNumber
            }.`,

      entityType:
        "transfer",

      entityId:
        transferId,

      priority:
        "normal",

      actionUrl:
        `/receipt?transferId=${transferId}`,

      metadata: {
        reference,
        transferType,

        settlementMode:
          destination
            ? "internal"
            : "simulation",

        ...(appliedFxRate &&
        destination
          ? {
              fxRateId:
                appliedFxRateId,

              fxRate:
                appliedFxRate,

              sourceCurrency:
                source.currency,

              destinationCurrency:
                destination.currency,

              sourceAmount:
                amount,

              destinationAmount,
            }
          : {}),
      },
    });

    /*
    |--------------------------------------------------------------------------
    | Recipient notification
    |--------------------------------------------------------------------------
    */

    if (
      destination?.user_id &&
      destination.user_id !==
        auth.userId
    ) {
      await notifications.create({
        connection,

        tenantId:
          auth.tenantId,

        userId:
          destination.user_id,

        notificationType:
          "transfer_received",

        title:
          "Money received",

        message:
          `${destinationAmount.toFixed(
            2
          )} ${
            destination.currency
          } was credited to your account.`,

        entityType:
          "transfer",

        entityId:
          transferId,

        priority:
          "normal",

        actionUrl:
          "/transactions",

        metadata: {
          reference,

          sourceAccountNumber:
            source.account_number,

          ...(appliedFxRate
            ? {
                fxRateId:
                  appliedFxRateId,

                fxRate:
                  appliedFxRate,

                sourceCurrency:
                  source.currency,

                destinationCurrency:
                  destination.currency,

                sourceAmount:
                  amount,

                destinationAmount,
              }
            : {}),
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await connection.commit();

    return repo.findById({
      transferId,
      tenantId:
        auth.tenantId,
    });
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Client transfer history
|--------------------------------------------------------------------------
*/

const listOwn = ({
  auth,
  page,
  pageSize,
}) => {
  const limit =
    Math.min(
      pageSize,
      100
    );

  const offset =
    (page - 1) *
    limit;

  return repo.findByUser({
    userId:
      auth.userId,

    tenantId:
      auth.tenantId,

    limit,
    offset,
  });
};

const getOwn = async ({
  auth,
  transferId,
}) => {
  const transfer =
    await repo.findById({
      transferId,
      tenantId:
        auth.tenantId,
    });

  if (
    !transfer ||
    transfer.user_id !==
      auth.userId
  ) {
    throw httpError(
      404,
      "Transfer not found"
    );
  }

  return transfer;
};

/*
|--------------------------------------------------------------------------
| Tenant administrator services
|--------------------------------------------------------------------------
*/

const listTenant = async ({
  auth,
  page,
  pageSize,
}) => {
  const limit =
    Math.min(
      pageSize,
      100
    );

  const offset =
    (page - 1) *
    limit;

  const [
    transfers,
    total,
  ] =
    await Promise.all([
      repo.findByTenant({
        tenantId:
          auth.tenantId,

        limit,
        offset,
      }),

      repo.countByTenant({
        tenantId:
          auth.tenantId,
      }),
    ]);

  return {
    transfers,

    pagination: {
      page,

      pageSize:
        limit,

      total,

      totalPages:
        Math.ceil(
          total /
            limit
        ),
    },
  };
};

const getTenant = async ({
  auth,
  transferId,
}) => {
  const transfer =
    await repo.findById({
      transferId,
      tenantId:
        auth.tenantId,
    });

  if (!transfer) {
    throw httpError(
      404,
      "Transfer not found"
    );
  }

  return transfer;
};

const updateTenant = async ({
  auth,
  transferId,
  body,
}) => {
  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const transfer =
      await repo.findByIdForUpdate({
        connection,

        transferId,

        tenantId:
          auth.tenantId,
      });

    if (!transfer) {
      throw httpError(
        404,
        "Transfer not found"
      );
    }

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim() ||
          null
        : transfer.description;

    const updated =
      await repo.updateDescription({
        connection,

        transferId,

        tenantId:
          auth.tenantId,

        description,
      });

    if (!updated) {
      throw httpError(
        400,
        "Unable to update transfer"
      );
    }

    await connection.commit();

    return repo.findById({
      transferId,
      tenantId:
        auth.tenantId,
    });
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createInternalTransfer,
  listOwn,
  getOwn,
  listTenant,
  getTenant,
  updateTenant,
 
};