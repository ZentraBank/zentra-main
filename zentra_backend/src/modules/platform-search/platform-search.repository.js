const db = require("../../config/db");

const buildPagination = ({
  page,
  limit,
  total,
}) => ({
  page,
  limit,
  total,
  totalPages: Math.max(
    1,
    Math.ceil(total / limit)
  ),
});

const searchUsers = async ({
  page,
  limit,
  search,
  tenantId,
  status,
  userType,
}) => {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 20;
  const offset = (safePage - 1) * safeLimit;

  const conditions = [
    "u.deleted_at IS NULL",
  ];

  const values = [];

  if (search) {
    conditions.push(`
      (
        u.email LIKE ?
        OR u.first_name LIKE ?
        OR u.last_name LIKE ?
        OR CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) LIKE ?
      )
    `);

    const term = `%${search}%`;
    values.push(term, term, term, term);
  }

  if (tenantId) {
    conditions.push("tm.tenant_id = ?");
    values.push(tenantId);
  }

  if (status) {
    conditions.push("u.status = ?");
    values.push(status);
  }

  if (userType) {
    conditions.push("r.code = ?");
    values.push(userType);
  }

  const where = `WHERE ${conditions.join(
    " AND "
  )}`;

  const [rows] = await db.query(
    `
      SELECT
        u.id,
        tm.tenant_id,
        t.name AS tenant_name,
        t.slug AS tenant_code,

        u.email,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.phone,
        u.avatar_url,

        r.code AS user_type,
        r.name AS role_name,

        u.status,
        tm.status AS membership_status,

        u.email_verified_at,
        u.phone_verified_at,
        u.last_login_at,
        u.created_at,
        u.updated_at

      FROM users u

      INNER JOIN tenant_memberships tm
        ON tm.user_id = u.id

      INNER JOIN tenants t
        ON t.id = tm.tenant_id

      INNER JOIN roles r
        ON r.id = tm.role_id

      ${where}

      ORDER BY u.created_at DESC

      LIMIT ?
      OFFSET ?
    `,
    [
      ...values,
      safeLimit,
      offset,
    ]
  );

  const [countRows] = await db.query(
    `
      SELECT
        COUNT(*) AS total

      FROM users u

      INNER JOIN tenant_memberships tm
        ON tm.user_id = u.id

      INNER JOIN tenants t
        ON t.id = tm.tenant_id

      INNER JOIN roles r
        ON r.id = tm.role_id

      ${where}
    `,
    values
  );

  const total = Number(
    countRows[0]?.total || 0
  );

  return {
    rows,
    meta: buildPagination({
      page: safePage,
      limit: safeLimit,
      total,
    }),
  };
};

const searchAccounts = async ({
  page,
  limit,
  search,
  tenantId,
  status,
  accountType,
}) => {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 20;
  const offset =
    (safePage - 1) * safeLimit;

  const conditions = [];
  const values = [];

  if (search) {
    conditions.push(`
      (
        a.account_number LIKE ?
        OR a.account_name LIKE ?
        OR u.email LIKE ?
        OR CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) LIKE ?
      )
    `);

    const term = `%${search}%`;

    values.push(
      term,
      term,
      term,
      term
    );
  }

  if (tenantId) {
    conditions.push(
      "a.tenant_id = ?"
    );

    values.push(tenantId);
  }

  if (status) {
    conditions.push(
      "a.status = ?"
    );

    values.push(status);
  }

  if (accountType) {
    conditions.push(
      "a.account_type = ?"
    );

    values.push(accountType);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(
        " AND "
      )}`
    : "";

  const [rows] = await db.query(
    `
      SELECT
        a.id,
        a.tenant_id,

        t.name AS tenant_name,
        t.slug AS tenant_code,

        a.user_id,

        u.email,
        u.first_name,
        u.last_name,

        a.account_number,
        a.account_name,
        a.account_type,
        a.currency,
        a.balance,
        a.status,
        a.created_at,
        a.updated_at

      FROM accounts a

      INNER JOIN tenants t
        ON t.id = a.tenant_id

      INNER JOIN users u
        ON u.id = a.user_id

      ${where}

      ORDER BY a.created_at DESC

      LIMIT ?
      OFFSET ?
    `,
    [
      ...values,
      safeLimit,
      offset,
    ]
  );

  const [countRows] =
    await db.query(
      `
        SELECT COUNT(*) AS total

        FROM accounts a

        INNER JOIN tenants t
          ON t.id = a.tenant_id

        INNER JOIN users u
          ON u.id = a.user_id

        ${where}
      `,
      values
    );

  const total = Number(
    countRows[0]?.total || 0
  );

  return {
    rows,

    meta: buildPagination({
      page: safePage,
      limit: safeLimit,
      total,
    }),
  };
};

const searchTransactions = async ({
  page,
  limit,
  search,
  tenantId,
  status,
  transactionType,
  dateFrom,
  dateTo,
}) => {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 20;
  const offset = (safePage - 1) * safeLimit;

  const conditions = [];
  const values = [];

  if (search) {
    conditions.push(`
      (
        tr.reference LIKE ?
        OR tr.description LIKE ?
        OR tr.destination_account_number LIKE ?
      )
    `);

    const term = `%${search}%`;
    values.push(term, term, term);
  }

  if (tenantId) {
    conditions.push("tr.tenant_id = ?");
    values.push(tenantId);
  }

  if (status) {
    conditions.push("tr.status = ?");
    values.push(status);
  }

  /*
   * Your transfers table does not have transaction_type.
   * Every row returned here is a transfer.
   */
  if (
    transactionType &&
    transactionType !== "transfer"
  ) {
    return {
      rows: [],
      meta: buildPagination({
        page: safePage,
        limit: safeLimit,
        total: 0,
      }),
    };
  }

  if (dateFrom) {
    conditions.push("tr.created_at >= ?");
    values.push(dateFrom);
  }

  if (dateTo) {
    conditions.push("tr.created_at <= ?");
    values.push(dateTo);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await db.query(
    `
      SELECT
        tr.id,
        tr.tenant_id,

        t.name AS tenant_name,
        t.slug AS tenant_code,

        tr.user_id,
        tr.source_account_id AS account_id,
        tr.destination_account_id,
        tr.destination_account_number,

        tr.reference,
        'transfer' AS transaction_type,

        tr.amount,
        tr.currency,
        tr.status,
        tr.description,
        tr.created_at,
        tr.updated_at

      FROM transfers tr

      INNER JOIN tenants t
        ON t.id = tr.tenant_id

      ${where}

      ORDER BY tr.created_at DESC

      LIMIT ?
      OFFSET ?
    `,
    [
      ...values,
      safeLimit,
      offset,
    ]
  );

  const [countRows] = await db.query(
    `
      SELECT COUNT(*) AS total

      FROM transfers tr

      INNER JOIN tenants t
        ON t.id = tr.tenant_id

      ${where}
    `,
    values
  );

  const total = Number(
    countRows[0]?.total || 0
  );

  return {
    rows,
    meta: buildPagination({
      page: safePage,
      limit: safeLimit,
      total,
    }),
  };
};

module.exports = {
  searchUsers,
  searchAccounts,
  searchTransactions,
};
