const { randomUUID } =
  require("crypto");

const repo =
  require("./ledger.repository");

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

const calculateBalance = (
  account,
  debitTotal,
  creditTotal
) => {
  if (
    account.normal_balance ===
    "debit"
  ) {
    return (
      Number(debitTotal) -
      Number(creditTotal)
    );
  }

  return (
    Number(creditTotal) -
    Number(debitTotal)
  );
};

const createLedgerAccount =
  async ({
    auth,
    body,
  }) => {
    const existing =
      await repo.findLedgerAccountByOwner({
        tenantId:
          auth.tenantId,

        ownerType:
          body.ownerType,

        ownerId:
          body.ownerId || null,

        currency:
          body.currency,
      });

    if (existing) {
      throw httpError(
        409,
        "A ledger account already exists for this owner and currency"
      );
    }

    return repo.createLedgerAccount({
      tenantId:
        auth.tenantId,

      ownerType:
        body.ownerType,

      ownerId:
        body.ownerId || null,

      code:
        body.code,

      name:
        body.name,

      currency:
        body.currency,

      normalBalance:
        body.normalBalance,
    });
  };

const validateEntries = async ({
  connection,
  tenantId,
  entries,
}) => {
  if (
    !entries ||
    entries.length < 2
  ) {
    throw httpError(
      422,
      "At least two ledger entries are required"
    );
  }

  const currencies =
    new Set();

  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    const account =
      await repo.findLedgerAccountById({
        connection,

        tenantId,

        ledgerAccountId:
          entry.ledgerAccountId,

        forUpdate:
          true,
      });

    if (!account) {
      throw httpError(
        404,
        "Ledger account not found"
      );
    }

    if (
      account.status !== "active"
    ) {
      throw httpError(
        409,
        "Ledger account is not active"
      );
    }

    if (
      account.currency !==
        entry.currency
    ) {
      throw httpError(
        422,
        "Entry currency does not match ledger account currency"
      );
    }

    currencies.add(
      entry.currency
    );

    if (
      entry.entryType ===
        "debit"
    ) {
      totalDebits +=
        Number(entry.amount);
    } else {
      totalCredits +=
        Number(entry.amount);
    }
  }

  if (
    currencies.size !== 1
  ) {
    throw httpError(
      422,
      "A journal must use one currency"
    );
  }

  if (
    Math.abs(
      totalDebits -
      totalCredits
    ) > 0.005
  ) {
    throw httpError(
      422,
      "Journal debits and credits must balance"
    );
  }
};

const postJournal =
  async ({
    auth,
    body,
  }) => {
    const existing =
      await repo.findJournalByIdempotencyKey({
        tenantId:
          auth.tenantId,

        idempotencyKey:
          body.idempotencyKey,
      });

    if (existing) {
      return {
        idempotent:
          true,

        journal:
          existing,
      };
    }

    const connection =
      await repo.db.getConnection();

    try {
      await connection.beginTransaction();

      await validateEntries({
        connection,

        tenantId:
          auth.tenantId,

        entries:
          body.entries,
      });

      const journalId =
        await repo.createJournal({
          connection,

          tenantId:
            auth.tenantId,

          reference:
            body.reference ||
            `JRN-${randomUUID()}`,

          idempotencyKey:
            body.idempotencyKey,

          transactionType:
            body.transactionType,

          description:
            body.description,

          sourceType:
            body.sourceType,

          sourceId:
            body.sourceId,

          postedBy:
            auth.userId,

          metadata:
            body.metadata,
        });

      for (
        const entry of
        body.entries
      ) {
        await repo.createEntry({
          connection,

          tenantId:
            auth.tenantId,

          journalId,

          ledgerAccountId:
            entry.ledgerAccountId,

          entryType:
            entry.entryType,

          amount:
            Number(
              entry.amount
            ).toFixed(2),

          currency:
            entry.currency,

          description:
            entry.description,
        });
      }

      await repo.markJournalPosted({
        connection,

        tenantId:
          auth.tenantId,

        journalId,
      });

      if (body.holdId) {
        const hold =
          await repo.findHoldById({
            connection,

            tenantId:
              auth.tenantId,

            holdId:
              body.holdId,

            forUpdate:
              true,
          });

        if (
          !hold ||
          hold.status !==
            "active"
        ) {
          throw httpError(
            409,
            "Active account hold not found"
          );
        }

        await repo.captureHold({
          connection,

          tenantId:
            auth.tenantId,

          holdId:
            hold.id,

          journalId,
        });
      }

      await connection.commit();

      return {
        idempotent:
          false,

        journal:
          await repo.findJournalById({
            tenantId:
              auth.tenantId,

            journalId,
          }),

        entries:
          await repo.listJournalEntries({
            tenantId:
              auth.tenantId,

            journalId,
          }),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

const reverseJournal =
  async ({
    auth,
    journalId,
    body,
  }) => {
    const connection =
      await repo.db.getConnection();

    try {
      await connection.beginTransaction();

      const original =
        await repo.findJournalById({
          connection,

          tenantId:
            auth.tenantId,

          journalId,

          forUpdate:
            true,
        });

      if (!original) {
        throw httpError(
          404,
          "Ledger journal not found"
        );
      }

      if (
        original.status !==
          "posted"
      ) {
        throw httpError(
          409,
          "Only posted journals can be reversed"
        );
      }

      const existing =
        await repo.findJournalByIdempotencyKey({
          connection,

          tenantId:
            auth.tenantId,

          idempotencyKey:
            body.idempotencyKey,
        });

      if (existing) {
        await connection.rollback();

        return {
          idempotent:
            true,

          journal:
            existing,
        };
      }

      const originalEntries =
        await repo.listJournalEntries({
          connection,

          tenantId:
            auth.tenantId,

          journalId,
        });

      const reversalJournalId =
        await repo.createJournal({
          connection,

          tenantId:
            auth.tenantId,

          reference:
            body.reference ||
            `REV-${original.reference}`,

          idempotencyKey:
            body.idempotencyKey,

          transactionType:
            `${original.transaction_type}_reversal`,

          description:
            body.reason,

          sourceType:
            "ledger_journal",

          sourceId:
            original.id,

          postedBy:
            auth.userId,

          metadata: {
            originalJournalId:
              original.id,

            reason:
              body.reason,
          },
        });

      for (
        const entry of
        originalEntries
      ) {
        await repo.createEntry({
          connection,

          tenantId:
            auth.tenantId,

          journalId:
            reversalJournalId,

          ledgerAccountId:
            entry.ledger_account_id,

          entryType:
            entry.entry_type ===
              "debit"
              ? "credit"
              : "debit",

          amount:
            entry.amount,

          currency:
            entry.currency,

          description:
            `Reversal of ${original.reference}`,
        });
      }

      await repo.markJournalPosted({
        connection,

        tenantId:
          auth.tenantId,

        journalId:
          reversalJournalId,
      });

      await repo.markJournalReversed({
        connection,

        tenantId:
          auth.tenantId,

        journalId:
          original.id,

        reversalJournalId,

        reversedBy:
          auth.userId,
      });

      await connection.commit();

      return {
        idempotent:
          false,

        originalJournalId:
          original.id,

        reversalJournal:
          await repo.findJournalById({
            tenantId:
              auth.tenantId,

            journalId:
              reversalJournalId,
          }),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

const getBalance =
  async ({
    auth,
    ledgerAccountId,
  }) => {
    const result =
      await repo.getLedgerAccountBalance({
        tenantId:
          auth.tenantId,

        ledgerAccountId,
      });

    if (!result) {
      throw httpError(
        404,
        "Ledger account not found"
      );
    }

    return {
      ...result,

      balance:
        calculateBalance(
          result,
          result.debit_total,
          result.credit_total
        ).toFixed(2),
    };
  };

const createHold =
  async ({
    auth,
    body,
  }) => {
    const account =
      await repo.findLedgerAccountByOwner({
        tenantId:
          auth.tenantId,

        ownerType:
          "customer_account",

        ownerId:
          body.accountId,

        currency:
          body.currency,
      });

    if (!account) {
      throw httpError(
        404,
        "Customer ledger account not found"
      );
    }

    const balanceResult =
      await repo.getLedgerAccountBalance({
        tenantId:
          auth.tenantId,

        ledgerAccountId:
          account.id,
      });

    const balance =
      calculateBalance(
        balanceResult,
        balanceResult.debit_total,
        balanceResult.credit_total
      );

    const heldAmount =
      await repo.getActiveHoldTotal({
        tenantId:
          auth.tenantId,

        accountId:
          body.accountId,
      });

    const available =
      balance -
      heldAmount;

    if (
      Number(body.amount) >
      available
    ) {
      throw httpError(
        422,
        "Insufficient available balance"
      );
    }

    return repo.createHold({
      tenantId:
        auth.tenantId,

      accountId:
        body.accountId,

      reference:
        body.reference,

      amount:
        Number(
          body.amount
        ).toFixed(2),

      currency:
        body.currency,

      reason:
        body.reason,

      expiresAt:
        body.expiresAt || null,

      createdBy:
        auth.userId,
    });
  };

const releaseHold =
  async ({
    auth,
    holdId,
  }) => {
    const connection =
      await repo.db.getConnection();

    try {
      await connection.beginTransaction();

      const hold =
        await repo.findHoldById({
          connection,

          tenantId:
            auth.tenantId,

          holdId,

          forUpdate:
            true,
        });

      if (!hold) {
        throw httpError(
          404,
          "Account hold not found"
        );
      }

      if (
        hold.status !== "active"
      ) {
        throw httpError(
          409,
          "Only active holds can be released"
        );
      }

      const updated =
        await repo.releaseHold({
          connection,

          tenantId:
            auth.tenantId,

          holdId,

          releasedBy:
            auth.userId,
        });

      await connection.commit();

      return updated;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

const expireHolds = ({
  auth,
}) =>
  repo.expireHolds({
    tenantId:
      auth.tenantId,
  });

const listJournals = ({
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

  return repo.listJournals({
    tenantId:
      auth.tenantId,

    status:
      query.status || null,

    transactionType:
      query.transactionType || null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

module.exports = {
  createLedgerAccount,
  postJournal,
  reverseJournal,
  getBalance,
  createHold,
  releaseHold,
  expireHolds,
  listJournals,
};
