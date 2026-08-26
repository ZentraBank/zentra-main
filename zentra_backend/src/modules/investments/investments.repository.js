const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createProduct = async ({
  tenantId,
  createdBy,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO investment_products (
        id,
        tenant_id,
        name,
        description,
        currency,
        minimum_amount,
        maximum_amount,
        annual_rate,
        duration_days,
        payout_type,
        risk_level,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.name,
      body.description || null,
      body.currency,
      body.minimumAmount,
      body.maximumAmount || null,
      body.annualRate,
      body.durationDays,
      body.payoutType,
      body.riskLevel,
      body.status,
      createdBy,
    ]
  );

  return findProductById({
    tenantId,
    productId: id,
  });
};

const findProductById = async ({
  tenantId,
  productId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM investment_products
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
    `,
    [productId, tenantId]
  );

  return rows[0] || null;
};

const listProducts = async ({
  tenantId,
  status,
  limit,
  offset,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];

  const values = [tenantId];

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM investment_products
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

const updateProduct = async ({
  tenantId,
  productId,
  body,
}) => {
  await db.query(
    `
      UPDATE investment_products
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        minimum_amount = COALESCE(?, minimum_amount),
        maximum_amount = COALESCE(?, maximum_amount),
        annual_rate = COALESCE(?, annual_rate),
        duration_days = COALESCE(?, duration_days),
        payout_type = COALESCE(?, payout_type),
        risk_level = COALESCE(?, risk_level),
        status = COALESCE(?, status)
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      body.name,
      body.description,
      body.minimumAmount,
      body.maximumAmount,
      body.annualRate,
      body.durationDays,
      body.payoutType,
      body.riskLevel,
      body.status,
      productId,
      tenantId,
    ]
  );

  return findProductById({
    tenantId,
    productId,
  });
};

const findAccountById = async ({
  tenantId,
  accountId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM accounts
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
    `,
    [accountId, tenantId]
  );

  return rows[0] || null;
};

const createInvestment = async ({
  connection = db,
  tenantId,
  userId,
  productId,
  sourceAccountId,
  principal,
  currency,
  annualRate,
  durationDays,
  expectedReturn,
  maturityAmount,
}) => {
  const id = randomUUID();

  await connection.query(
    `
      INSERT INTO investments (
        id,
        tenant_id,
        user_id,
        product_id,
        source_account_id,
        principal,
        currency,
        annual_rate,
        duration_days,
        expected_return,
        maturity_amount,
        status,
        started_at,
        maturity_date
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        'active',
        NOW(),
        DATE_ADD(NOW(), INTERVAL ? DAY)
      )
    `,
    [
      id,
      tenantId,
      userId,
      productId,
      sourceAccountId,
      principal,
      currency,
      annualRate,
      durationDays,
      expectedReturn,
      maturityAmount,
      durationDays,
    ]
  );

  return id;
};

const findInvestmentById = async ({
  tenantId,
  investmentId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        i.*,
        ip.name AS product_name,
        ip.payout_type,
        ip.risk_level
      FROM investments i
      INNER JOIN investment_products ip
        ON ip.id = i.product_id
      WHERE i.id = ?
        AND i.tenant_id = ?
      LIMIT 1
    `,
    [investmentId, tenantId]
  );

  return rows[0] || null;
};

const listInvestments = async ({
  tenantId,
  userId,
  status,
  adminView,
  limit,
  offset,
}) => {
  const conditions = [
    "i.tenant_id = ?",
  ];

  const values = [tenantId];

  if (!adminView) {
    conditions.push("i.user_id = ?");
    values.push(userId);
  }

  if (status) {
    conditions.push("i.status = ?");
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT
        i.*,
        ip.name AS product_name,
        ip.risk_level
      FROM investments i
      INNER JOIN investment_products ip
        ON ip.id = i.product_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

const markMatured = async ({
  tenantId,
}) => {
  const [result] =
    await db.query(
      `
        UPDATE investments
        SET
          status = 'matured',
          matured_at = COALESCE(
            matured_at,
            NOW()
          )
        WHERE tenant_id = ?
          AND status = 'active'
          AND maturity_date <= NOW()
      `,
      [
        tenantId,
      ]
    );

  return result.affectedRows;
};

const markAllMatured =
  async () => {
    const [result] =
      await db.query(
        `
          UPDATE investments
          SET
            status = 'matured',
            matured_at = COALESCE(
              matured_at,
              NOW()
            )
          WHERE status = 'active'
            AND maturity_date <= NOW()
        `
      );

    return result.affectedRows;
  };

const createWithdrawal = async ({
  tenantId,
  investmentId,
  userId,
  destinationAccountId,
  amount,
  currency,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO investment_withdrawals (
        id,
        tenant_id,
        investment_id,
        user_id,
        destination_account_id,
        amount,
        currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      investmentId,
      userId,
      destinationAccountId,
      amount,
      currency,
    ]
  );

  await db.query(
    `
      UPDATE investments
      SET status = 'withdrawal_requested'
      WHERE id = ?
        AND tenant_id = ?
    `,
    [investmentId, tenantId]
  );

  return findWithdrawalById({
    tenantId,
    withdrawalId: id,
  });
};

const findWithdrawalById = async ({
  tenantId,
  withdrawalId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM investment_withdrawals
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
    `,
    [withdrawalId, tenantId]
  );

  return rows[0] || null;
};

const listWithdrawals = async ({
  tenantId,
  status,
  limit,
  offset,
}) => {
  const [rows] = await db.query(
    `
      SELECT iw.*, i.product_id
      FROM investment_withdrawals iw
      INNER JOIN investments i
        ON i.id = iw.investment_id
      WHERE iw.tenant_id = ?
        AND iw.status = ?
      ORDER BY iw.created_at ASC
      LIMIT ? OFFSET ?
    `,
    [
      tenantId,
      status,
      limit,
      offset,
    ]
  );

  return rows;
};

const reviewWithdrawal = async ({
  tenantId,
  withdrawalId,
  reviewerId,
  status,
  rejectionReason,
}) => {
  await db.query(
    `
      UPDATE investment_withdrawals
      SET
        status = ?,
        reviewed_by = ?,
        reviewed_at = NOW(),
        rejection_reason = ?
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      status,
      reviewerId,
      rejectionReason || null,
      withdrawalId,
      tenantId,
    ]
  );

  if (status === "rejected") {
    const withdrawal =
      await findWithdrawalById({
        tenantId,
        withdrawalId,
      });

    await db.query(
      `
        UPDATE investments
        SET status = 'matured'
        WHERE id = ?
          AND tenant_id = ?
      `,
      [
        withdrawal.investment_id,
        tenantId,
      ]
    );
  }

  return findWithdrawalById({
    tenantId,
    withdrawalId,
  });
};

const completeWithdrawal = async ({
  connection = db,
  tenantId,
  withdrawalId,
  investmentId,
}) => {
  await connection.query(
    `
      UPDATE investment_withdrawals
      SET
        status = 'completed',
        completed_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
    `,
    [withdrawalId, tenantId]
  );

  await connection.query(
    `
      UPDATE investments
      SET
        status = 'completed',
        completed_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
    `,
    [investmentId, tenantId]
  );
};

const createEvent = async ({
  connection = db,
  tenantId,
  investmentId,
  withdrawalId = null,
  actorUserId = null,
  eventType,
  metadata = null,
}) => {
  await connection.query(
    `
      INSERT INTO investment_events (
        id,
        tenant_id,
        investment_id,
        withdrawal_id,
        actor_user_id,
        event_type,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      investmentId,
      withdrawalId,
      actorUserId,
      eventType,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );
};

const debitAccount = async ({
  connection = db,
  tenantId,
  accountId,
  amount,
}) => {
  const [result] =
    await connection.query(
      `
        UPDATE accounts
        SET balance = balance - ?
        WHERE id = ?
          AND tenant_id = ?
          AND status = 'active'
          AND balance >= ?
      `,
      [
        amount,
        accountId,
        tenantId,
        amount,
      ]
    );

  return (
    result.affectedRows === 1
  );
};

const creditAccount = async ({
  connection = db,
  tenantId,
  accountId,
  amount,
}) => {
  const [result] =
    await connection.query(
      `
        UPDATE accounts
        SET balance = balance + ?
        WHERE id = ?
          AND tenant_id = ?
          AND status = 'active'
      `,
      [
        amount,
        accountId,
        tenantId,
      ]
    );

  return (
    result.affectedRows === 1
  );
};

const findTenantClientByUserId =
  async ({
    tenantId,
    userId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            u.id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email,

            u.status
              AS user_status,

            tm.id
              AS membership_id,

            tm.status
              AS membership_status,

            r.id
              AS role_id,

            r.name
              AS role_name,

            r.code
              AS role_code

          FROM tenant_memberships tm

          INNER JOIN users u
            ON u.id =
              tm.user_id

          INNER JOIN roles r
            ON r.id =
              tm.role_id

          WHERE tm.tenant_id = ?
            AND tm.user_id = ?
            

          LIMIT 1
        `,
        [
          tenantId,
          userId,
        ]
      );

    return rows[0] || null;
  };

  const findDueInvestments =
  async () => {
    const [rows] =
      await db.query(
        `
          SELECT
            id,
            tenant_id,
            user_id,
            product_id,
            principal,
            currency,
            maturity_amount,
            maturity_date
          FROM investments
          WHERE status = 'active'
            AND maturity_date <= NOW()
        `
      );

    return rows;
  };

 const findTenantInvestmentManagers =
  async ({
    tenantId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT DISTINCT
            tm.user_id

          FROM tenant_memberships tm

          INNER JOIN roles r
            ON r.id =
              tm.role_id

          INNER JOIN role_permissions rp
            ON rp.role_id =
              r.id

          INNER JOIN permissions p
            ON p.id =
              rp.permission_id

          WHERE tm.tenant_id = ?
            AND tm.status = 'active'
            AND p.code IN (
              'investments.manage',
              'investments.withdrawals.review',
              'investments.withdrawals.complete'
            )
        `,
        [
          tenantId,
        ]
      );

    return rows;
  };

const findDueInvestmentsByTenant =
  async ({
    tenantId,
  }) => {
    const [rows] =
      await db.query(
        `
          SELECT
            id,
            tenant_id,
            user_id,
            product_id,
            source_account_id,
            principal,
            currency,
            annual_rate,
            duration_days,
            expected_return,
            maturity_amount,
            status,
            started_at,
            maturity_date

          FROM investments

          WHERE tenant_id = ?
            AND status = 'active'
            AND maturity_date <= NOW()

          ORDER BY maturity_date ASC
        `,
        [
          tenantId,
        ]
      );

    return rows;
  };

const markInvestmentMatured =
  async ({
    connection = db,
    tenantId,
    investmentId,
  }) => {
    const [result] =
      await connection.query(
        `
          UPDATE investments

          SET
            status = 'matured',
            matured_at = COALESCE(
              matured_at,
              NOW()
            )

          WHERE id = ?
            AND tenant_id = ?
            AND status = 'active'
            AND maturity_date <= NOW()
        `,
        [
          investmentId,
          tenantId,
        ]
      );

    return (
      result.affectedRows === 1
    );
  };

module.exports = {
  db,
  createProduct,
  findProductById,
  listProducts,
  updateProduct,
  findAccountById,
  createInvestment,
  findInvestmentById,
  listInvestments,
  markMatured,
  markAllMatured,
  createWithdrawal,
  findWithdrawalById,
  listWithdrawals,
  reviewWithdrawal,
  completeWithdrawal,
  createEvent,
  debitAccount,
  creditAccount,
  findTenantClientByUserId,
  findDueInvestments,
markInvestmentMatured,
  findTenantInvestmentManagers,
  findDueInvestmentsByTenant,

};
