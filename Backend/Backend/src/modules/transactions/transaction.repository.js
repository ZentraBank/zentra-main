const db = require("../../config/db");
const auditService = require("../auditLogs/audit.service");
const notificationService = require("../notifications/notification.service");

async function findTransactionsByAccount({
  accountId,
  tenantId,
  limit,
  offset,
  type,
  status,
}) {
  let sql = `
    SELECT *
    FROM transactions
    WHERE account_id = ? AND tenant_id = ?
  `;

  const params = [accountId, tenantId];

  if (type) {
    sql += ` AND type = ?`;
    params.push(type);
  }

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const [rows] = await db.query(sql, params);

  return rows;
}

async function findTransactionById(id, tenantId) {
  const [rows] = await db.query(
    `SELECT *
     FROM transactions
     WHERE id = ? AND tenant_id = ?
     LIMIT 1`,
    [id, tenantId]
  );

  return rows[0];
}

async function createInternalTransfer({
  tenantId,
  fromAccountId,
  toAccountId,
  amount,
  description,
  createdBy,
}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [fromRows] = await connection.query(
      `SELECT * FROM accounts 
       WHERE id = ? AND tenant_id = ? 
       FOR UPDATE`,
      [fromAccountId, tenantId]
    );

    if (fromRows.length === 0) {
      throw new Error("Sender account not found");
    }

    const fromAccount = fromRows[0];

    if (fromAccount.status !== "active") {
      throw new Error("Sender account is not active");
    }

    if (Number(fromAccount.balance) < Number(amount)) {
      throw new Error("Insufficient balance");
    }

    const [toRows] = await connection.query(
      `SELECT * FROM accounts 
       WHERE id = ? AND tenant_id = ? 
       FOR UPDATE`,
      [toAccountId, tenantId]
    );

    if (toRows.length === 0) {
      throw new Error("Receiver account not found");
    }

    const toAccount = toRows[0];

    if (toAccount.status !== "active") {
      throw new Error("Receiver account is not active");
    }

    await connection.query(
      `UPDATE accounts 
       SET balance = balance - ? 
       WHERE id = ? AND tenant_id = ?`,
      [amount, fromAccountId, tenantId]
    );

    await connection.query(
      `UPDATE accounts 
       SET balance = balance + ? 
       WHERE id = ? AND tenant_id = ?`,
      [amount, toAccountId, tenantId]
    );

    const reference = `ZB-TX-${Date.now()}`;

    await connection.query(
      `INSERT INTO transactions
       (tenant_id, account_id, related_account_id, type, amount, reference, description, status, created_by)
       VALUES (?, ?, ?, 'debit', ?, ?, ?, 'successful', ?)`,
      [
        tenantId,
        fromAccountId,
        toAccountId,
        amount,
        `${reference}-D`,
        description || "Internal transfer debit",
        createdBy,
      ]
    );

    await connection.query(
      `INSERT INTO transactions
       (tenant_id, account_id, related_account_id, type, amount, reference, description, status, created_by)
       VALUES (?, ?, ?, 'credit', ?, ?, ?, 'successful', ?)`,
      [
        tenantId,
        toAccountId,
        fromAccountId,
        amount,
        `${reference}-C`,
        description || "Internal transfer credit",
        createdBy,
      ]
    );

    await connection.commit();

    return {
      reference,
      amount,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      status: "successful",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  await auditService.logAction({
  tenantId,
  userId: createdBy,
  action: "TRANSFER",
  entityType: "transaction",
  entityId: null,
  metadata: {
    amount,
    reference,
    fromAccountId,
    toAccountId,
  },
});

    await notificationService.notifyUser({
  tenantId,
  userId: fromAccount.user_id,
  title: "Transfer sent",
  message: `You sent ₦${amount}.`,
  type: "transaction",
  metadata: {
    amount,
    reference,
    fromAccountId,
    toAccountId,
  },
});

    await notificationService.notifyUser({
    tenantId,
    userId: toAccount.user_id,
    title: "Transfer received",
    message: `You received ₦${amount}.`,
    type: "transaction",
    metadata: {
        amount,
        reference,
        fromAccountId,
        toAccountId,
    },
    });
}

async function createAdminCredit({
  tenantId,
  accountId,
  amount,
  description,
  createdBy,
}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [accounts] = await connection.query(
      `SELECT * FROM accounts 
       WHERE id = ? AND tenant_id = ? 
       FOR UPDATE`,
      [accountId, tenantId]
    );

    if (accounts.length === 0) {
      throw new Error("Account not found");
    }

    if (accounts[0].status !== "active") {
      throw new Error("Account is not active");
    }

    await connection.query(
      `UPDATE accounts 
       SET balance = balance + ? 
       WHERE id = ? AND tenant_id = ?`,
      [amount, accountId, tenantId]
    );

    const reference = `ZB-CR-${Date.now()}`;

    await connection.query(
      `INSERT INTO transactions
       (tenant_id, account_id, type, amount, reference, description, status, created_by)
       VALUES (?, ?, 'credit', ?, ?, ?, 'successful', ?)`,
      [
        tenantId,
        accountId,
        amount,
        reference,
        description || "Admin credit",
        createdBy,
      ]
    );

    await connection.commit();
        await notificationService.notifyUser({
    tenantId,
    userId: accounts[0].user_id,
    title: "Account credited",
    message: `Your account has been credited with ₦${amount}.`,
    type: "transaction",
    metadata: {
        amount,
        reference,
        accountId,
    },
    });
    return {
      reference,
      account_id: accountId,
      amount,
      type: "credit",
      status: "successful",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  await auditService.logAction({
  tenantId,
  userId: createdBy,
  action: "ADMIN_CREDIT",
  entityType: "account",
  entityId: accountId,
  metadata: {
    amount,
    reference,
  },
});
}

async function createAdminDebit({
  tenantId,
  accountId,
  amount,
  description,
  createdBy,
}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [accounts] = await connection.query(
      `SELECT * FROM accounts 
       WHERE id = ? AND tenant_id = ? 
       FOR UPDATE`,
      [accountId, tenantId]
    );

    if (accounts.length === 0) {
      throw new Error("Account not found");
    }

    const account = accounts[0];

    if (account.status !== "active") {
      throw new Error("Account is not active");
    }

    if (Number(account.balance) < Number(amount)) {
      throw new Error("Insufficient balance");
    }

    await connection.query(
      `UPDATE accounts 
       SET balance = balance - ? 
       WHERE id = ? AND tenant_id = ?`,
      [amount, accountId, tenantId]
    );

    const reference = `ZB-DB-${Date.now()}`;

    await connection.query(
      `INSERT INTO transactions
       (tenant_id, account_id, type, amount, reference, description, status, created_by)
       VALUES (?, ?, 'debit', ?, ?, ?, 'successful', ?)`,
      [
        tenantId,
        accountId,
        amount,
        reference,
        description || "Admin debit",
        createdBy,
      ]
    );

        await connection.query(
    `INSERT INTO audit_logs
    (tenant_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
        tenantId,
        createdBy,
        "ADMIN_CREDIT",
        "account",
        accountId,
        JSON.stringify({ amount, reference })
    ]
    );
    await connection.commit();

    await notificationService.notifyUser({
  tenantId,
  userId: account.user_id,
  title: "Account debited",
  message: `Your account has been debited with ₦${amount}.`,
  type: "transaction",
  metadata: {
    amount,
    reference,
    accountId,
  },
});

    return {
      reference,
      account_id: accountId,
      amount,
      type: "debit",
      status: "successful",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  await auditService.logAction({
    tenantId,
    userId: createdBy,
    action: "ADMIN_DEBIT",
    entityType: "account",
    entityId: accountId,
    metadata: {
        amount,
        reference,
    },
    });

}



module.exports = {
  findTransactionsByAccount,
  findTransactionById,
  createInternalTransfer,
  createAdminCredit,
  createAdminDebit,
};