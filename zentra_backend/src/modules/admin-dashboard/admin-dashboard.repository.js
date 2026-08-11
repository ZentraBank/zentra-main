const db =
  require("../../config/db");

const getOverview = async ({
  tenantId,
  dateFrom,
  dateTo,
}) => {
  const [
    usersResult,
    accountsResult,
    balancesResult,
    transfersResult,
    subscriptionsResult,
    kycResult,
    loansResult,
    investmentsResult,
    donationsResult,
  ] = await Promise.all([
    db.query(
      `
        SELECT
          COUNT(*) AS total_users,
          SUM(
            CASE
              WHEN status = 'active'
              THEN 1 ELSE 0
            END
          ) AS active_users,
          SUM(
            CASE
              WHEN created_at BETWEEN ? AND ?
              THEN 1 ELSE 0
            END
          ) AS new_users
        FROM users
        WHERE tenant_id = ?
      `,
      [dateFrom, dateTo, tenantId]
    ),

    db.query(
      `
        SELECT
          COUNT(*) AS total_accounts,
          SUM(
            CASE
              WHEN status = 'active'
              THEN 1 ELSE 0
            END
          ) AS active_accounts,
          SUM(
            CASE
              WHEN status = 'dormant'
              THEN 1 ELSE 0
            END
          ) AS dormant_accounts,
          SUM(
            CASE
              WHEN status IN (
                'frozen',
                'blocked'
              )
              THEN 1 ELSE 0
            END
          ) AS restricted_accounts
        FROM accounts
        WHERE tenant_id = ?
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT
          currency,
          SUM(balance) AS total_balance,
          COUNT(*) AS account_count
        FROM accounts
        WHERE tenant_id = ?
        GROUP BY currency
        ORDER BY currency ASC
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT
          COUNT(*) AS total_transfers,
          SUM(
            CASE
              WHEN status = 'completed'
              THEN 1 ELSE 0
            END
          ) AS completed_transfers,
          SUM(
            CASE
              WHEN status = 'pending'
              THEN 1 ELSE 0
            END
          ) AS pending_transfers,
          SUM(
            CASE
              WHEN status = 'failed'
              THEN 1 ELSE 0
            END
          ) AS failed_transfers,
          COALESCE(
            SUM(
              CASE
                WHEN status = 'completed'
                THEN amount ELSE 0
              END
            ),
            0
          ) AS completed_volume
        FROM transfers
        WHERE tenant_id = ?
          AND created_at BETWEEN ? AND ?
      `,
      [tenantId, dateFrom, dateTo]
    ),

    db.query(
      `
        SELECT
          COUNT(*) AS total_subscriptions,
          SUM(
            CASE
              WHEN status = 'active'
              THEN 1 ELSE 0
            END
          ) AS active_subscriptions,
          SUM(
            CASE
              WHEN status = 'pending'
              THEN 1 ELSE 0
            END
          ) AS pending_subscriptions,
          SUM(
            CASE
              WHEN status = 'expired'
              THEN 1 ELSE 0
            END
          ) AS expired_subscriptions
        FROM subscriptions
        WHERE tenant_id = ?
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT
          COUNT(*) AS total_profiles,
          SUM(
            CASE
              WHEN status = 'approved'
              THEN 1 ELSE 0
            END
          ) AS approved,
          SUM(
            CASE
              WHEN status IN (
                'submitted',
                'under_review'
              )
              THEN 1 ELSE 0
            END
          ) AS pending_review,
          SUM(
            CASE
              WHEN status = 'rejected'
              THEN 1 ELSE 0
            END
          ) AS rejected
        FROM kyc_profiles
        WHERE tenant_id = ?
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT
          COUNT(*) AS total_loans,
          SUM(
            CASE
              WHEN status = 'active'
              THEN 1 ELSE 0
            END
          ) AS active_loans,
          SUM(
            CASE
              WHEN status = 'defaulted'
              THEN 1 ELSE 0
            END
          ) AS defaulted_loans,
          COALESCE(
            SUM(outstanding_balance),
            0
          ) AS outstanding_balance
        FROM loans
        WHERE tenant_id = ?
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT
          COUNT(*) AS total_investments,
          SUM(
            CASE
              WHEN status = 'active'
              THEN 1 ELSE 0
            END
          ) AS active_investments,
          COALESCE(
            SUM(
              CASE
                WHEN status IN (
                  'active',
                  'matured',
                  'withdrawal_requested'
                )
                THEN principal
                ELSE 0
              END
            ),
            0
          ) AS invested_principal
        FROM investments
        WHERE tenant_id = ?
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT
          COUNT(*) AS total_requests,
          SUM(
            CASE
              WHEN status = 'pending'
              THEN 1 ELSE 0
            END
          ) AS pending_requests,
          SUM(
            CASE
              WHEN status = 'redeemed'
              THEN 1 ELSE 0
            END
          ) AS redeemed_requests,
          COALESCE(
            SUM(
              CASE
                WHEN status = 'redeemed'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS redeemed_volume
        FROM donation_requests
        WHERE tenant_id = ?
      `,
      [tenantId]
    ),
  ]);

  return {
    users:
      usersResult[0][0],

    accounts:
      accountsResult[0][0],

    balances:
      balancesResult[0],

    transfers:
      transfersResult[0][0],

    subscriptions:
      subscriptionsResult[0][0],

    kyc:
      kycResult[0][0],

    loans:
      loansResult[0][0],

    investments:
      investmentsResult[0][0],

    donations:
      donationsResult[0][0],
  };
};

const getTransferTrend = async ({
  tenantId,
  dateFrom,
  dateTo,
  granularity,
}) => {
  const format =
    granularity === "month"
      ? "%Y-%m-01"
      : granularity === "week"
        ? "%x-%v"
        : "%Y-%m-%d";

  const [rows] =
    await db.query(
      `
        SELECT
          DATE_FORMAT(
            created_at,
            ?
          ) AS period,
          currency,
          COUNT(*) AS transfer_count,
          COALESCE(
            SUM(
              CASE
                WHEN status = 'completed'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS completed_volume,
          SUM(
            CASE
              WHEN status = 'failed'
              THEN 1 ELSE 0
            END
          ) AS failed_count
        FROM transfers
        WHERE tenant_id = ?
          AND created_at BETWEEN ? AND ?
        GROUP BY
          period,
          currency
        ORDER BY period ASC
      `,
      [
        format,
        tenantId,
        dateFrom,
        dateTo,
      ]
    );

  return rows;
};

const getCustomerGrowth = async ({
  tenantId,
  dateFrom,
  dateTo,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          DATE(created_at) AS period,
          COUNT(*) AS new_users
        FROM users
        WHERE tenant_id = ?
          AND created_at BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY period ASC
      `,
      [
        tenantId,
        dateFrom,
        dateTo,
      ]
    );

  return rows;
};

const getAccountDistribution = async ({
  tenantId,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          account_type,
          currency,
          status,
          COUNT(*) AS account_count,
          COALESCE(
            SUM(balance),
            0
          ) AS total_balance
        FROM accounts
        WHERE tenant_id = ?
        GROUP BY
          account_type,
          currency,
          status
        ORDER BY
          account_type,
          currency,
          status
      `,
      [tenantId]
    );

  return rows;
};

const getRecentActivity = async ({
  tenantId,
  limit,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          id,
          actor_user_id,
          action,
          entity_type,
          entity_id,
          status,
          description,
          metadata,
          created_at
        FROM audit_logs
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `,
      [
        tenantId,
        limit,
      ]
    );

  return rows;
};

const getPendingActions = async ({
  tenantId,
}) => {
  const [
    kycResult,
    subscriptionResult,
    loanResult,
    donationResult,
    withdrawalResult,
  ] = await Promise.all([
    db.query(
      `
        SELECT COUNT(*) AS count
        FROM kyc_profiles
        WHERE tenant_id = ?
          AND status IN (
            'submitted',
            'under_review'
          )
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT COUNT(*) AS count
        FROM subscriptions
        WHERE tenant_id = ?
          AND status = 'pending'
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT COUNT(*) AS count
        FROM loan_applications
        WHERE tenant_id = ?
          AND status IN (
            'submitted',
            'under_review'
          )
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT COUNT(*) AS count
        FROM donation_requests
        WHERE tenant_id = ?
          AND status = 'pending'
      `,
      [tenantId]
    ),

    db.query(
      `
        SELECT
          (
            SELECT COUNT(*)
            FROM investment_withdrawals
            WHERE tenant_id = ?
              AND status = 'pending'
          )
          +
          (
            SELECT COUNT(*)
            FROM donation_redemptions
            WHERE tenant_id = ?
              AND status = 'approved'
          )
          AS count
      `,
      [tenantId, tenantId]
    ),
  ]);

  return {
    kycReviews:
      Number(
        kycResult[0][0].count
      ),

    subscriptions:
      Number(
        subscriptionResult[0][0].count
      ),

    loanApplications:
      Number(
        loanResult[0][0].count
      ),

    donationRequests:
      Number(
        donationResult[0][0].count
      ),

    financialCompletions:
      Number(
        withdrawalResult[0][0].count
      ),
  };
};

module.exports = {
  getOverview,
  getTransferTrend,
  getCustomerGrowth,
  getAccountDistribution,
  getRecentActivity,
  getPendingActions,
};
