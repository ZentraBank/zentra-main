module.exports = {
  QUEUES: {
    BANKING:
      "zentrabank-banking",
    MAINTENANCE:
      "zentrabank-maintenance",
    NOTIFICATIONS:
      "zentrabank-notifications",
  },

  JOBS: {
    EXPIRE_APPROVALS:
      "expire-approval-requests",

    EXPIRE_HOLDS:
      "expire-account-holds",

    ACCRUE_INTEREST:
      "accrue-daily-interest",

    POST_INTEREST:
      "post-due-interest",

    RECONCILE_LEDGER:
      "reconcile-ledger-balances",

    RETRY_NOTIFICATIONS:
      "retry-failed-notifications",

    CLEANUP_SESSIONS:
      "cleanup-expired-sessions",

    CLEANUP_LOCKS:
      "cleanup-job-locks",
  },
};
