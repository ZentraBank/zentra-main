const { randomUUID } = require("crypto");
const db = require("../../config/db");

const findById = async ({ accountId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT * FROM accounts WHERE id = ? AND tenant_id = ? LIMIT 1`,
    [accountId, tenantId]
  );
  return rows[0] || null;
};

const findByUser = async ({ userId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT * FROM accounts
     WHERE user_id = ? AND tenant_id = ?
     ORDER BY created_at DESC`,
    [userId, tenantId]
  );
  return rows;
};

const countByUser = async ({ userId, tenantId }) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) total FROM accounts
     WHERE user_id = ? AND tenant_id = ? AND status <> 'closed'`,
    [userId, tenantId]
  );
  return Number(rows[0]?.total || 0);
};

const existsByNumber = async ({ accountNumber, tenantId }) => {
  const [rows] = await db.query(
    `SELECT id FROM accounts
     WHERE account_number = ? AND tenant_id = ? LIMIT 1`,
    [accountNumber, tenantId]
  );
  return Boolean(rows[0]);
};

const create = async (input) => {
  const id = randomUUID();
  await db.query(
    `INSERT INTO accounts
     (id, user_id, tenant_id, account_number, account_name,
      account_type, currency, balance, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active')`,
    [id, input.userId, input.tenantId, input.accountNumber,
     input.accountName, input.accountType, input.currency]
  );
  return findById({ accountId: id, tenantId: input.tenantId });
};

const updateStatus = async ({ accountId, tenantId, status }) => {
  await db.query(
    `UPDATE accounts SET status = ?
     WHERE id = ? AND tenant_id = ?`,
    [status, accountId, tenantId]
  );
  return findById({ accountId, tenantId });
};

const findByTenant = async ({ tenantId }) => {
  const [rows] = await db.query(
    `SELECT
       a.id,
       a.user_id,
       a.tenant_id,
       a.account_number,
       a.account_name,
       a.account_type,
       a.currency,
       a.balance,
       a.status,
       a.created_at,
       a.updated_at,

       u.first_name,
       u.middle_name,
       u.last_name,
       CONCAT_WS(
         ' ',
         u.first_name,
         u.middle_name,
         u.last_name
       ) AS client_name,
       u.email AS client_email,
       u.phone AS client_phone,
       u.avatar_url AS client_avatar_url

     FROM accounts a

     INNER JOIN users u
       ON u.id = a.user_id

     INNER JOIN tenant_memberships tm
       ON tm.user_id = u.id
      AND tm.tenant_id = a.tenant_id

     INNER JOIN roles r
       ON r.id = tm.role_id
      AND r.code = 'customer'

     WHERE a.tenant_id = ?
       AND u.deleted_at IS NULL

     ORDER BY a.created_at DESC`,
    [tenantId]
  );

  return rows;
};

// const updateBalance = async ({
//   accountId,
//   tenantId,
//   balance,
// }) => {
//   await db.query(
//     `UPDATE accounts
//      SET balance = ?, updated_at = NOW()
//      WHERE id = ? AND tenant_id = ?`,
//     [balance, accountId, tenantId]
//   );

//   return findById({
//     accountId,
//     tenantId,
//   });
// };


const findTenantAccountById = async ({
  tenantId,
  accountId,
}) => {
  const [rows] = await db.query(
    `SELECT
       a.id,
       a.user_id,
       a.tenant_id,
       a.account_number,
       a.account_name,
       a.account_type,
       a.currency,
       a.balance,
       a.status,
       a.created_at,
       a.updated_at,

       u.first_name,
       u.middle_name,
       u.last_name,
       CONCAT_WS(
         ' ',
         u.first_name,
         u.middle_name,
         u.last_name
       ) AS client_name,
       u.email AS client_email,
       u.phone AS client_phone,
       u.avatar_url AS client_avatar_url

     FROM accounts a

     INNER JOIN users u
       ON u.id = a.user_id

     INNER JOIN tenant_memberships tm
       ON tm.user_id = u.id
      AND tm.tenant_id = a.tenant_id

     INNER JOIN roles r
       ON r.id = tm.role_id
      AND r.code = 'customer'

     WHERE a.id = ?
       AND a.tenant_id = ?
       AND u.deleted_at IS NULL

     LIMIT 1`,
    [
      accountId,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const findByIdForUpdate = async ({
  connection,
  accountId,
  tenantId,
}) => {
  const [rows] = await connection.query(
    `SELECT *
     FROM accounts
     WHERE id = ?
       AND tenant_id = ?
     LIMIT 1
     FOR UPDATE`,
    [accountId, tenantId]
  );

  return rows[0] || null;
};

const adjustBalance = async ({
  connection,
  accountId,
  tenantId,
  amount,
}) => {
  const [result] = await connection.query(
    `UPDATE accounts
     SET
       balance = balance + ?,
       updated_at = NOW()
     WHERE id = ?
       AND tenant_id = ?`,
    [
      amount,
      accountId,
      tenantId,
    ]
  );

  return result.affectedRows === 1;
};

const createAdjustmentLedgerEntry = async ({
  connection,
  tenantId,
  accountId,
  entryType,
  amount,
  balanceAfter,
  description,
}) => {
  const id = randomUUID();

  await connection.query(
    `INSERT INTO account_ledger_entries (
       id,
       tenant_id,
       account_id,
       transfer_id,
       entry_type,
       amount,
       balance_after,
       description
     )
     VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`,
    [
      id,
      tenantId,
      accountId,
      entryType,
      amount,
      balanceAfter,
      description,
    ]
  );

  return id;
};

const findActivityByUser = async ({
  userId,
  tenantId,
  limit,
  offset,
}) => {
  const [rows] = await db.query(
    `SELECT
       le.id,
       le.tenant_id,
       le.account_id,
       le.transfer_id,
       le.entry_type,
       le.amount,
       le.balance_after,
       le.description,
       le.created_at,

       a.account_number,
       a.account_name,
       a.account_type,
       a.currency

     FROM account_ledger_entries le

     INNER JOIN accounts a
       ON a.id = le.account_id
      AND a.tenant_id = le.tenant_id

     WHERE a.user_id = ?
       AND le.tenant_id = ?

     ORDER BY le.created_at DESC

     LIMIT ? OFFSET ?`,
    [
      userId,
      tenantId,
      limit,
      offset,
    ]
  );

  return rows;
};

const countActivityByUser = async ({
  userId,
  tenantId,
}) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total

     FROM account_ledger_entries le

     INNER JOIN accounts a
       ON a.id = le.account_id
      AND a.tenant_id = le.tenant_id

     WHERE a.user_id = ?
       AND le.tenant_id = ?`,
    [
      userId,
      tenantId,
    ]
  );

  return Number(
    rows[0]?.total || 0
  );
};

const findTransferDestinationByNumber = async ({
  tenantId,
  accountNumber,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        a.id,
        a.account_number,
        a.account_name,
        a.account_type,
        a.currency,
        a.status,
        a.user_id

      FROM accounts a

      WHERE a.tenant_id = ?
        AND a.account_number = ?
        AND a.status <> 'closed'

      LIMIT 1
    `,
    [
      tenantId,
      accountNumber,
    ]
  );

  return rows[0] || null;
};

const findActiveCustomerMembership =
  async ({
    userId,
    tenantId,
    connection = db,
  }) => {
    const [rows] =
      await connection.query(
        `
          SELECT
            tm.user_id,
            tm.tenant_id,
            tm.status,
            r.code AS role_code

          FROM tenant_memberships tm

          INNER JOIN roles r
            ON r.id = tm.role_id

          INNER JOIN users u
            ON u.id = tm.user_id

          WHERE tm.user_id = ?
            AND tm.tenant_id = ?
            AND tm.status = 'active'
            AND r.code = 'customer'
            AND u.status = 'active'
            AND u.deleted_at IS NULL

          LIMIT 1
        `,
        [
          userId,
          tenantId,
        ]
      );

    return rows[0] || null;
  };

const findActivityByTenant = async ({
  tenantId,
  limit,
  offset,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          le.id,
          le.tenant_id,
          le.account_id,
          le.transfer_id,
          le.entry_type,
          le.amount,
          le.balance_after,
          le.description,
          le.created_at,

          a.user_id,
          a.account_number,
          a.account_name,
          a.account_type,
          a.currency,

          CONCAT_WS(
            ' ',
            u.first_name,
            u.middle_name,
            u.last_name
          ) AS client_name,

          u.email AS client_email

        FROM account_ledger_entries le

        INNER JOIN accounts a
          ON a.id =
            le.account_id
         AND a.tenant_id =
            le.tenant_id

        INNER JOIN users u
          ON u.id =
            a.user_id

        WHERE le.tenant_id = ?

        ORDER BY
          le.created_at DESC

        LIMIT ? OFFSET ?
      `,
      [
        tenantId,
        limit,
        offset,
      ],
    );

  return rows;
};

const countActivityByTenant = async ({
  tenantId,
}) => {
  const [rows] =
    await db.query(
      `
        SELECT
          COUNT(*) AS total

        FROM account_ledger_entries le

        WHERE le.tenant_id = ?
      `,
      [
        tenantId,
      ],
    );

  return Number(
    rows[0]?.total || 0,
  );
};

module.exports = {
  findById, findByUser, countByUser,
  existsByNumber, create, updateStatus,
  findByTenant, findTenantAccountById,
  findByIdForUpdate, adjustBalance,
  createAdjustmentLedgerEntry,
  findActivityByUser, countActivityByUser,
  findTransferDestinationByNumber,
  findActiveCustomerMembership,
  findActivityByTenant,
  countActivityByTenant,
};
