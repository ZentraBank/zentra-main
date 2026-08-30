const repo =
  require("./reconciliation.repository");

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

const calculateLedgerBalance = (
  row
) => {
  if (!row.ledger_account_id) {
    return 0;
  }

  if (
    row.normal_balance ===
    "debit"
  ) {
    return (
      Number(row.debit_total) -
      Number(row.credit_total)
    );
  }

  return (
    Number(row.credit_total) -
    Number(row.debit_total)
  );
};

const runLedgerVsAccounts =
  async ({
    auth,
    body,
  }) => {
    const run =
      await repo.createRun({
        tenantId:
          auth.tenantId,

        runType:
          "ledger_vs_accounts",

        currency:
          body.currency || null,

        startedBy:
          auth.userId,

        metadata: {
          tolerance:
            Number(
              body.tolerance
            ),
        },
      });

    await repo.markRunProcessing({
      tenantId:
        auth.tenantId,

      runId:
        run.id,
    });

    try {
      const rows =
        await repo.getLedgerVsAccounts({
          tenantId:
            auth.tenantId,

          currency:
            body.currency || null,
        });

      const connection =
        await repo.db.pool.getConnection();

      let matched = 0;
      let mismatched = 0;

      try {
        await connection.beginTransaction();

        for (const row of rows) {
          const ledgerBalance =
            calculateLedgerBalance(
              row
            );

          const accountBalance =
            Number(
              row.account_balance
            );

          const difference =
            Number(
              (
                ledgerBalance -
                accountBalance
              ).toFixed(2)
            );

          const status =
            Math.abs(difference) <=
            Number(body.tolerance)
              ? "matched"
              : "mismatched";

          if (
            status === "matched"
          ) {
            matched += 1;
          } else {
            mismatched += 1;
          }

          await repo.createItem({
            connection,

            tenantId:
              auth.tenantId,

            runId:
              run.id,

            sourceType:
              "account",

            sourceId:
              row.account_id,

            reference:
              row.account_number,

            currency:
              row.currency,

            internalAmount:
              ledgerBalance.toFixed(2),

            externalAmount:
              accountBalance.toFixed(2),

            differenceAmount:
              difference.toFixed(2),

            status,

            metadata: {
              ledgerAccountId:
                row.ledger_account_id,

              debitTotal:
                row.debit_total,

              creditTotal:
                row.credit_total,
            },
          });
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

      return repo.completeRun({
        tenantId:
          auth.tenantId,

        runId:
          run.id,

        totalRecords:
          rows.length,

        matchedRecords:
          matched,

        mismatchedRecords:
          mismatched,
      });
    } catch (error) {
      await repo.failRun({
        tenantId:
          auth.tenantId,

        runId:
          run.id,

        reason:
          error.message,
      });

      throw error;
    }
  };

const listRuns = ({
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

  return repo.listRuns({
    tenantId:
      auth.tenantId,

    status:
      query.status || null,

    runType:
      query.runType || null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

const getRun = async ({
  auth,
  runId,
}) => {
  const run =
    await repo.findRunById({
      tenantId:
        auth.tenantId,

      runId,
    });

  if (!run) {
    throw httpError(
      404,
      "Reconciliation run not found"
    );
  }

  return run;
};

const listItems = async ({
  auth,
  runId,
  query,
}) => {
  await getRun({
    auth,
    runId,
  });

  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listItems({
    tenantId:
      auth.tenantId,

    runId,

    status:
      query.status || null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

const updateItem = async ({
  auth,
  itemId,
  body,
}) => {
  const item =
    await repo.findItemById({
      tenantId:
        auth.tenantId,

      itemId,
    });

  if (!item) {
    throw httpError(
      404,
      "Reconciliation item not found"
    );
  }

  if (
    ["resolved", "ignored"]
      .includes(body.status) &&
    !body.resolutionNote
  ) {
    throw httpError(
      422,
      "A resolution note is required"
    );
  }

  return repo.updateItemStatus({
    tenantId:
      auth.tenantId,

    itemId,

    status:
      body.status,

    resolutionNote:
      body.resolutionNote,

    resolvedBy:
      auth.userId,
  });
};

module.exports = {
  runLedgerVsAccounts,
  listRuns,
  getRun,
  listItems,
  updateItem,
};
