const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createExport = async ({
  tenantId,
  requestedBy,
  reportType,
  format,
  filters,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO report_exports (
        id,
        tenant_id,
        requested_by,
        report_type,
        format,
        filters
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      requestedBy,
      reportType,
      format,
      filters
        ? JSON.stringify(filters)
        : null,
    ]
  );

  return findExportById({
    tenantId,
    exportId: id,
  });
};

const findExportById = async ({
  tenantId,
  exportId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM report_exports
      WHERE id = ?
        AND tenant_id = ?
      LIMIT 1
    `,
    [exportId, tenantId]
  );

  return rows[0] || null;
};

const listExports = async ({
  tenantId,
  requestedBy,
  adminView,
  status,
  limit,
  offset,
}) => {
  const conditions = [
    "tenant_id = ?",
  ];

  const values = [tenantId];

  if (!adminView) {
    conditions.push(
      "requested_by = ?"
    );
    values.push(requestedBy);
  }

  if (status) {
    conditions.push(
      "status = ?"
    );
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM report_exports
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return rows;
};

const markProcessing = ({
  tenantId,
  exportId,
}) =>
  db.query(
    `
      UPDATE report_exports
      SET
        status = 'processing',
        started_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
    `,
    [exportId, tenantId]
  );

const markCompleted = async ({
  tenantId,
  exportId,
  fileName,
  fileUrl,
  rowCount,
  expiresAt,
}) => {
  await db.query(
    `
      UPDATE report_exports
      SET
        status = 'completed',
        file_name = ?,
        file_url = ?,
        row_count = ?,
        completed_at = NOW(),
        expires_at = ?
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      fileName,
      fileUrl,
      rowCount,
      expiresAt,
      exportId,
      tenantId,
    ]
  );

  return findExportById({
    tenantId,
    exportId,
  });
};

const markFailed = async ({
  tenantId,
  exportId,
  reason,
}) => {
  await db.query(
    `
      UPDATE report_exports
      SET
        status = 'failed',
        failure_reason = ?,
        completed_at = NOW()
      WHERE id = ?
        AND tenant_id = ?
    `,
    [
      reason,
      exportId,
      tenantId,
    ]
  );

  return findExportById({
    tenantId,
    exportId,
  });
};

const buildWhere = ({
  tenantId,
  alias,
  filters,
  dateColumn = "created_at",
}) => {
  const conditions = [
    `${alias}.tenant_id = ?`,
  ];

  const values = [tenantId];

  if (filters.dateFrom) {
    conditions.push(
      `${alias}.${dateColumn} >= ?`
    );
    values.push(
      `${filters.dateFrom} 00:00:00`
    );
  }

  if (filters.dateTo) {
    conditions.push(
      `${alias}.${dateColumn} <= ?`
    );
    values.push(
      `${filters.dateTo} 23:59:59`
    );
  }

  if (filters.status) {
    conditions.push(
      `${alias}.status = ?`
    );
    values.push(filters.status);
  }

  if (filters.currency) {
    conditions.push(
      `${alias}.currency = ?`
    );
    values.push(filters.currency);
  }

  return {
    clause:
      conditions.join(" AND "),

    values,
  };
};

const getTransfersReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "t",
      filters,
    });

  const [rows] = await db.query(
    `
      SELECT
        t.id,
        t.reference,
        t.transfer_type,
        t.amount,
        t.fee,
        t.currency,
        t.status,
        t.sender_account_id,
        t.recipient_account_id,
        t.recipient_name,
        t.recipient_bank_name,
        t.failure_reason,
        t.created_at,
        t.completed_at
      FROM transfers t
      WHERE ${where.clause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

const getAccountsReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "a",
      filters,
    });

  const [rows] = await db.query(
    `
      SELECT
        a.id,
        a.user_id,
        a.account_number,
        a.account_name,
        a.account_type,
        a.currency,
        a.balance,
        a.available_balance,
        a.status,
        a.created_at
      FROM accounts a
      WHERE ${where.clause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

const getUsersReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "u",
      filters,
    });

  const [rows] = await db.query(
    `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.status,
        u.created_at,
        kp.status AS kyc_status
      FROM users u
      LEFT JOIN kyc_profiles kp
        ON kp.user_id = u.id
        AND kp.tenant_id = u.tenant_id
      WHERE ${where.clause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

const getSubscriptionsReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "s",
      filters,
    });

  const [rows] = await db.query(
    `
      SELECT
        s.id,
        s.user_id,
        s.plan_id,
        s.amount,
        s.currency,
        s.status,
        s.started_at,
        s.expires_at,
        s.created_at
      FROM subscriptions s
      WHERE ${where.clause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

const getKycReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "k",
      filters,
      dateColumn: "submitted_at",
    });

  const [rows] = await db.query(
    `
      SELECT
        k.id,
        k.user_id,
        k.status,
        k.risk_level,
        k.identity_type,
        k.identity_number,
        k.country,
        k.submitted_at,
        k.reviewed_at,
        k.rejection_reason
      FROM kyc_profiles k
      WHERE ${where.clause}
      ORDER BY k.submitted_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

const getLoansReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "l",
      filters,
    });

  const [rows] = await db.query(
    `
      SELECT
        l.id,
        l.user_id,
        l.principal,
        l.total_interest,
        l.total_repayable,
        l.outstanding_balance,
        l.currency,
        l.annual_interest_rate,
        l.term_months,
        l.repayment_frequency,
        l.status,
        l.started_at,
        l.maturity_date,
        l.completed_at
      FROM loans l
      WHERE ${where.clause}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

const getInvestmentsReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "i",
      filters,
    });

  const [rows] = await db.query(
    `
      SELECT
        i.id,
        i.user_id,
        i.product_id,
        i.principal,
        i.expected_return,
        i.maturity_amount,
        i.currency,
        i.annual_rate,
        i.duration_days,
        i.status,
        i.started_at,
        i.maturity_date,
        i.completed_at
      FROM investments i
      WHERE ${where.clause}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

const getDonationsReport = async ({
  tenantId,
  filters,
  limit,
  offset,
}) => {
  const where =
    buildWhere({
      tenantId,
      alias: "d",
      filters,
    });

  const [rows] = await db.query(
    `
      SELECT
        d.id,
        d.donor_id,
        d.beneficiary_user_id,
        d.account_id,
        d.amount,
        d.currency,
        d.purpose,
        d.status,
        d.approved_at,
        d.rejected_at,
        d.rejection_reason,
        d.created_at
      FROM donation_requests d
      WHERE ${where.clause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...where.values,
      limit,
      offset,
    ]
  );

  return rows;
};

module.exports = {
  createExport,
  findExportById,
  listExports,
  markProcessing,
  markCompleted,
  markFailed,
  getTransfersReport,
  getAccountsReport,
  getUsersReport,
  getSubscriptionsReport,
  getKycReport,
  getLoansReport,
  getInvestmentsReport,
  getDonationsReport,
};
