const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createProgram = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO virtual_account_programs (
        id,
        tenant_id,
        code,
        name,
        currency,
        country_code,
        payment_rail_id,
        settlement_account_id,
        settlement_ledger_account_id,
        collection_clearing_ledger_account_id,
        fee_ledger_account_id,
        account_number_prefix,
        account_number_length,
        allocation_mode,
        reconciliation_mode,
        status,
        metadata,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.currency,
      body.countryCode || null,
      body.paymentRailId || null,
      body.settlementAccountId,
      body.settlementLedgerAccountId,
      body.collectionClearingLedgerAccountId,
      body.feeLedgerAccountId || null,
      body.accountNumberPrefix || null,
      body.accountNumberLength,
      body.allocationMode,
      body.reconciliationMode,
      body.status,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
      createdBy,
    ]
  );

  return findProgramById({
    tenantId,
    programId: id,
  });
};

const findProgramById = async ({
  tenantId,
  programId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM virtual_account_programs
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, programId]
  );

  return rows[0] || null;
};

const findVirtualAccountByAccountNumber = async ({
  tenantId,
  accountNumber,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM virtual_accounts
      WHERE tenant_id = ?
        AND account_number = ?
      LIMIT 1
    `,
    [tenantId, accountNumber]
  );

  return rows[0] || null;
};

const findVirtualAccountByReference = async ({
  tenantId,
  reference,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM virtual_accounts
      WHERE tenant_id = ?
        AND (
          virtual_account_reference = ?
          OR expected_payer_reference = ?
        )
      LIMIT 1
    `,
    [tenantId, reference, reference]
  );

  return rows[0] || null;
};

const createVirtualAccount = async ({
  tenantId,
  ownerUserId,
  body,
  accountNumber,
}) => {
  const id = randomUUID();
  const reference =
    `VA-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO virtual_accounts (
        id,
        tenant_id,
        program_id,
        owner_user_id,
        owner_business_id,
        master_account_id,
        master_ledger_account_id,
        virtual_account_reference,
        account_number,
        account_name,
        external_account_reference,
        purpose,
        expected_payer_name,
        expected_payer_reference,
        fixed_amount,
        maximum_amount,
        currency,
        collection_mode,
        expiry_at,
        status,
        activated_at,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), ?)
    `,
    [
      id,
      tenantId,
      body.programId,
      ownerUserId || null,
      body.ownerBusinessId || null,
      body.masterAccountId,
      body.masterLedgerAccountId,
      reference,
      accountNumber,
      body.accountName,
      body.externalAccountReference || null,
      body.purpose || null,
      body.expectedPayerName || null,
      body.expectedPayerReference || null,
      body.fixedAmount ?? null,
      body.maximumAmount ?? null,
      body.currency,
      body.collectionMode,
      body.expiryAt || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findVirtualAccountById({
    tenantId,
    virtualAccountId: id,
  });
};

const findVirtualAccountById = async ({
  tenantId,
  virtualAccountId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM virtual_accounts
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, virtualAccountId]
  );

  return rows[0] || null;
};

const listVirtualAccounts = async ({
  tenantId,
  ownerUserId,
  programId,
  status,
  limit,
  offset,
}) => {
  const conditions = ["tenant_id = ?"];
  const values = [tenantId];

  if (ownerUserId) {
    conditions.push("owner_user_id = ?");
    values.push(ownerUserId);
  }

  if (programId) {
    conditions.push("program_id = ?");
    values.push(programId);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM virtual_accounts
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

const findCollectionByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM collection_transactions
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const createCollection = async ({
  tenantId,
  body,
  match,
}) => {
  const id = randomUUID();
  const reference =
    `COL-${Date.now()}-${id.slice(0, 8)}`;

  const netAmount =
    Number(body.amount) -
    Number(body.feeAmount || 0);

  await db.query(
    `
      INSERT INTO collection_transactions (
        id,
        tenant_id,
        virtual_account_id,
        program_id,
        collection_reference,
        external_reference,
        idempotency_key,
        payer_name,
        payer_account_reference,
        payer_bank_code,
        payer_reference,
        amount,
        fee_amount,
        net_amount,
        currency,
        status,
        match_method,
        confidence_score,
        received_at,
        matched_at,
        raw_payload,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      match.virtualAccountId || null,
      body.programId,
      reference,
      body.externalReference,
      body.idempotencyKey,
      body.payerName || null,
      body.payerAccountReference || null,
      body.payerBankCode || null,
      body.payerReference || null,
      body.amount,
      body.feeAmount || 0,
      netAmount,
      body.currency,
      match.virtualAccountId
        ? "matched"
        : "unmatched",
      match.matchMethod,
      match.confidenceScore || null,
      body.receivedAt,
      match.virtualAccountId
        ? new Date()
        : null,
      body.rawPayload
        ? JSON.stringify(body.rawPayload)
        : null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findCollectionById({
    tenantId,
    collectionId: id,
  });
};

const findCollectionById = async ({
  tenantId,
  collectionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM collection_transactions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, collectionId]
  );

  return rows[0] || null;
};

const markCollectionPosted = async ({
  tenantId,
  collectionId,
  journalId,
}) => {
  await db.query(
    `
      UPDATE collection_transactions
      SET
        status = 'posted',
        ledger_journal_id = ?,
        posted_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [journalId, tenantId, collectionId]
  );

  const collection =
    await findCollectionById({
      tenantId,
      collectionId,
    });

  if (collection.virtual_account_id) {
    await db.query(
      `
        UPDATE virtual_accounts
        SET
          total_collected =
            total_collected + ?,
          collection_count =
            collection_count + 1,
          status = CASE
            WHEN collection_mode = 'single_use'
            THEN 'closed'
            ELSE status
          END,
          closed_at = CASE
            WHEN collection_mode = 'single_use'
            THEN NOW()
            ELSE closed_at
          END
        WHERE tenant_id = ?
          AND id = ?
      `,
      [
        collection.net_amount,
        tenantId,
        collection.virtual_account_id,
      ]
    );
  }

  return collection;
};

const manualMatchCollection = async ({
  tenantId,
  collectionId,
  virtualAccountId,
}) => {
  await db.query(
    `
      UPDATE collection_transactions
      SET
        virtual_account_id = ?,
        status = 'matched',
        match_method = 'manual',
        confidence_score = 100,
        matched_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
        AND status IN (
          'unmatched',
          'pending_review'
        )
    `,
    [
      virtualAccountId,
      tenantId,
      collectionId,
    ]
  );

  return findCollectionById({
    tenantId,
    collectionId,
  });
};

const createSweepRule = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO sweep_rules (
        id,
        tenant_id,
        virtual_account_program_id,
        virtual_account_id,
        code,
        name,
        sweep_type,
        threshold_amount,
        retain_amount,
        destination_account_id,
        destination_ledger_account_id,
        frequency,
        execution_time,
        timezone,
        status,
        priority,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.programId || null,
      body.virtualAccountId || null,
      body.code,
      body.name,
      body.sweepType,
      body.thresholdAmount ?? null,
      body.retainAmount || 0,
      body.destinationAccountId,
      body.destinationLedgerAccountId,
      body.frequency || null,
      body.executionTime || null,
      body.timezone,
      body.status,
      body.priority,
      createdBy,
    ]
  );

  return findSweepRuleById({
    tenantId,
    sweepRuleId: id,
  });
};

const findSweepRuleById = async ({
  tenantId,
  sweepRuleId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM sweep_rules
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, sweepRuleId]
  );

  return rows[0] || null;
};

module.exports = {
  createProgram,
  findProgramById,
  findVirtualAccountByAccountNumber,
  findVirtualAccountByReference,
  createVirtualAccount,
  findVirtualAccountById,
  listVirtualAccounts,
  findCollectionByIdempotency,
  createCollection,
  findCollectionById,
  markCollectionPosted,
  manualMatchCollection,
  createSweepRule,
  findSweepRuleById,
};
