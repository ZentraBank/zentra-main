const approvalsService =
  require("../approvals/approvals.service");

const ledgerRepository =
  require("../ledger/ledger.repository");

const reconciliationService =
  require("../reconciliation/reconciliation.service");

const jobsRepository =
  require("./jobs.repository");

const handlers = {
  "expire-approval-requests":
    async ({ tenantId }) => {
      const updatedCount =
        await approvalsService
          .expireRequests({
            auth: {
              tenantId,
            },
          });

      return {
        updatedCount,
      };
    },

  "expire-account-holds":
    async ({ tenantId }) => {
      const updatedCount =
        await ledgerRepository
          .expireHolds({
            tenantId,
          });

      return {
        updatedCount,
      };
    },

  "reconcile-ledger-balances":
    async ({
      tenantId,
      payload,
    }) =>
      reconciliationService
        .runLedgerVsAccounts({
          auth: {
            tenantId,
            userId:
              payload.systemUserId,
          },

          body: {
            currency:
              payload.currency ||
              undefined,

            tolerance:
              payload.tolerance ??
              0.01,
          },
        }),

  "cleanup-job-locks":
    async () => ({
      deletedCount:
        await jobsRepository
          .cleanupExpiredLocks(),
    }),
};

const registerHandler = (
  jobName,
  handler
) => {
  if (
    typeof handler !==
    "function"
  ) {
    throw new TypeError(
      "Job handler must be a function"
    );
  }

  handlers[jobName] =
    handler;
};

const getHandler = (
  jobName
) => {
  const handler =
    handlers[jobName];

  if (!handler) {
    const error =
      new Error(
        `No handler registered for ${jobName}`
      );

    error.statusCode = 500;
    throw error;
  }

  return handler;
};

module.exports = {
  registerHandler,
  getHandler,
};
