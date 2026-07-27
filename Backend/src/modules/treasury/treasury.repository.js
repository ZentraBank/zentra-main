const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createFeeDefinition = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO fee_definitions (
        id,
        tenant_id,
        code,
        name,
        description,
        event_type,
        calculation_type,
        fixed_amount,
        percentage_rate,
        minimum_fee,
        maximum_fee,
        currency,
        tiers,
        revenue_ledger_account_id,
        tax_ledger_account_id,
        tax_rate,
        status,
        priority,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.description || null,
      body.eventType,
      body.calculationType,
      body.fixedAmount ?? null,
      body.percentageRate ?? null,
      body.minimumFee ?? null,
      body.maximumFee ?? null,
      body.currency || null,
      body.tiers
        ? JSON.stringify(body.tiers)
        : null,
      body.revenueLedgerAccountId,
      body.taxLedgerAccountId || null,
      body.taxRate ?? null,
      body.status,
      body.priority,
      createdBy,
    ]
  );

  return findFeeDefinitionById({
    tenantId,
    feeDefinitionId: id,
  });
};

const findFeeDefinitionById = async ({
  tenantId,
  feeDefinitionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fee_definitions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, feeDefinitionId]
  );

  return rows[0] || null;
};

const findApplicableFeeDefinition = async ({
  tenantId,
  eventType,
  currency,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fee_definitions
      WHERE tenant_id = ?
        AND event_type = ?
        AND status = 'active'
        AND (
          currency IS NULL
          OR currency = ?
        )
      ORDER BY priority ASC, created_at ASC
      LIMIT 1
    `,
    [tenantId, eventType, currency]
  );

  return rows[0] || null;
};

const listFeeDefinitions = async ({
  tenantId,
  eventType,
  status,
}) => {
  const conditions = ["tenant_id = ?"];
  const values = [tenantId];

  if (eventType) {
    conditions.push("event_type = ?");
    values.push(eventType);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM fee_definitions
      WHERE ${conditions.join(" AND ")}
      ORDER BY priority ASC, created_at ASC
    `,
    values
  );

  return rows;
};

const findFeeAssessmentByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fee_assessments
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const createFeeAssessment = async ({
  tenantId,
  feeDefinition,
  body,
  feeAmount,
  taxAmount,
  totalAmount,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO fee_assessments (
        id,
        tenant_id,
        fee_definition_id,
        source_type,
        source_id,
        account_id,
        customer_ledger_account_id,
        idempotency_key,
        reference,
        base_amount,
        fee_amount,
        tax_amount,
        total_amount,
        currency,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      feeDefinition.id,
      body.sourceType,
      body.sourceId,
      body.accountId,
      body.customerLedgerAccountId,
      body.idempotencyKey,
      body.reference,
      body.baseAmount,
      feeAmount,
      taxAmount,
      totalAmount,
      body.currency,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findFeeAssessmentById({
    tenantId,
    assessmentId: id,
  });
};

const findFeeAssessmentById = async ({
  tenantId,
  assessmentId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fee_assessments
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, assessmentId]
  );

  return rows[0] || null;
};

const markFeePosted = async ({
  tenantId,
  assessmentId,
  journalId,
}) => {
  await db.query(
    `
      UPDATE fee_assessments
      SET
        status = 'posted',
        ledger_journal_id = ?,
        posted_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [journalId, tenantId, assessmentId]
  );

  return findFeeAssessmentById({
    tenantId,
    assessmentId,
  });
};

const waiveFee = async ({
  tenantId,
  assessmentId,
  waivedBy,
  reason,
}) => {
  await db.query(
    `
      UPDATE fee_assessments
      SET
        status = 'waived',
        waived_by = ?,
        waiver_reason = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'pending'
    `,
    [
      waivedBy,
      reason,
      tenantId,
      assessmentId,
    ]
  );

  return findFeeAssessmentById({
    tenantId,
    assessmentId,
  });
};

const createInterestProduct = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO interest_products (
        id,
        tenant_id,
        code,
        name,
        description,
        product_type,
        annual_rate,
        calculation_basis,
        day_count_convention,
        posting_frequency,
        minimum_balance,
        maximum_balance,
        currency,
        expense_ledger_account_id,
        income_ledger_account_id,
        payable_ledger_account_id,
        receivable_ledger_account_id,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.description || null,
      body.productType,
      body.annualRate,
      body.calculationBasis,
      body.dayCountConvention,
      body.postingFrequency,
      body.minimumBalance ?? null,
      body.maximumBalance ?? null,
      body.currency,
      body.expenseLedgerAccountId || null,
      body.incomeLedgerAccountId || null,
      body.payableLedgerAccountId || null,
      body.receivableLedgerAccountId || null,
      body.status,
      createdBy,
    ]
  );

  return findInterestProductById({
    tenantId,
    productId: id,
  });
};

const findInterestProductById = async ({
  tenantId,
  productId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM interest_products
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, productId]
  );

  return rows[0] || null;
};

const listInterestProducts = async ({
  tenantId,
  productType,
  status,
}) => {
  const conditions = ["tenant_id = ?"];
  const values = [tenantId];

  if (productType) {
    conditions.push("product_type = ?");
    values.push(productType);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM interest_products
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
    `,
    values
  );

  return rows;
};

const findAccrualByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM interest_accruals
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const createAccrual = async ({
  tenantId,
  product,
  body,
  dayFraction,
  accruedAmount,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO interest_accruals (
        id,
        tenant_id,
        interest_product_id,
        source_type,
        source_id,
        account_id,
        customer_ledger_account_id,
        accrual_date,
        period_start,
        period_end,
        principal_amount,
        annual_rate,
        day_fraction,
        accrued_amount,
        currency,
        idempotency_key,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      product.id,
      body.sourceType,
      body.sourceId,
      body.accountId || null,
      body.customerLedgerAccountId || null,
      body.accrualDate,
      body.periodStart,
      body.periodEnd,
      body.principalAmount,
      product.annual_rate,
      dayFraction,
      accruedAmount,
      product.currency,
      body.idempotencyKey,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findAccrualById({
    tenantId,
    accrualId: id,
  });
};

const findAccrualById = async ({
  tenantId,
  accrualId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM interest_accruals
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, accrualId]
  );

  return rows[0] || null;
};

const markAccrualPosted = async ({
  tenantId,
  accrualId,
  journalId,
}) => {
  await db.query(
    `
      UPDATE interest_accruals
      SET
        status = 'posted',
        ledger_journal_id = ?,
        posted_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [journalId, tenantId, accrualId]
  );

  return findAccrualById({
    tenantId,
    accrualId,
  });
};

const upsertTreasuryPosition = async ({
  tenantId,
  currency,
  positionDate,
  liabilities,
  cashAssets,
  loanAssets,
  investmentLiabilities,
  netLiquidity,
  metadata,
}) => {
  await db.query(
    `
      INSERT INTO treasury_positions (
        id,
        tenant_id,
        currency,
        position_date,
        total_customer_liabilities,
        total_cash_assets,
        total_loan_assets,
        total_investment_liabilities,
        net_liquidity_position,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_customer_liabilities =
          VALUES(total_customer_liabilities),
        total_cash_assets =
          VALUES(total_cash_assets),
        total_loan_assets =
          VALUES(total_loan_assets),
        total_investment_liabilities =
          VALUES(total_investment_liabilities),
        net_liquidity_position =
          VALUES(net_liquidity_position),
        metadata = VALUES(metadata)
    `,
    [
      randomUUID(),
      tenantId,
      currency,
      positionDate,
      liabilities,
      cashAssets,
      loanAssets,
      investmentLiabilities,
      netLiquidity,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

  const [rows] = await db.query(
    `
      SELECT *
      FROM treasury_positions
      WHERE tenant_id = ?
        AND currency = ?
        AND position_date = ?
      LIMIT 1
    `,
    [
      tenantId,
      currency,
      positionDate,
    ]
  );

  return rows[0] || null;
};

module.exports = {
  db,
  createFeeDefinition,
  findFeeDefinitionById,
  findApplicableFeeDefinition,
  listFeeDefinitions,
  findFeeAssessmentByIdempotency,
  createFeeAssessment,
  findFeeAssessmentById,
  markFeePosted,
  waiveFee,
  createInterestProduct,
  findInterestProductById,
  listInterestProducts,
  findAccrualByIdempotency,
  createAccrual,
  findAccrualById,
  markAccrualPosted,
  upsertTreasuryPosition,
};
