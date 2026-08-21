const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createRateSource = async ({
  tenantId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO fx_rate_sources (
        id,
        tenant_id,
        code,
        name,
        provider_type,
        priority,
        status,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      body.global ? null : tenantId,
      body.code,
      body.name,
      body.providerType,
      body.priority,
      body.status,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findRateSourceById({
    tenantId,
    sourceId: id,
  });
};

const findRateSourceById = async ({
  tenantId,
  sourceId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_rate_sources
      WHERE id = ?
        AND (
          tenant_id = ?
          OR tenant_id IS NULL
        )
      LIMIT 1
    `,
    [sourceId, tenantId]
  );

  return rows[0] || null;
};

const createRate = async ({
  tenantId,
  body,
}) => {
  const id = randomUUID();

  await db.query(
    `
      UPDATE fx_rates
      SET status = 'superseded'
      WHERE (
          tenant_id = ?
          OR (
            tenant_id IS NULL
            AND ? IS NULL
          )
        )
        AND base_currency = ?
        AND quote_currency = ?
        AND rate_source_id = ?
        AND status = 'active'
    `,
    [
      body.global ? null : tenantId,
      body.global ? null : tenantId,
      body.baseCurrency,
      body.quoteCurrency,
      body.rateSourceId,
    ]
  );

  await db.query(
    `
      INSERT INTO fx_rates (
        id,
        tenant_id,
        rate_source_id,
        base_currency,
        quote_currency,
        bid_rate,
        ask_rate,
        mid_rate,
        effective_at,
        expires_at,
        external_reference,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      body.global ? null : tenantId,
      body.rateSourceId,
      body.baseCurrency,
      body.quoteCurrency,
      body.bidRate,
      body.askRate,
      body.midRate,
      body.effectiveAt,
      body.expiresAt || null,
      body.externalReference || null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findRateById({
    tenantId,
    rateId: id,
  });
};

const findRateById = async ({
  tenantId,
  rateId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_rates
      WHERE id = ?
        AND (
          tenant_id = ?
          OR tenant_id IS NULL
        )
      LIMIT 1
    `,
    [rateId, tenantId]
  );

  return rows[0] || null;
};

const findBestRate = async ({
  tenantId,
  baseCurrency,
  quoteCurrency,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        r.*,
        s.priority AS source_priority
      FROM fx_rates r
      INNER JOIN fx_rate_sources s
        ON s.id = r.rate_source_id
      WHERE (
          r.tenant_id = ?
          OR r.tenant_id IS NULL
        )
        AND (
          s.tenant_id = ?
          OR s.tenant_id IS NULL
        )
        AND r.base_currency = ?
        AND r.quote_currency = ?
        AND r.status = 'active'
        AND s.status = 'active'
        AND r.effective_at <= NOW()
        AND (
          r.expires_at IS NULL
          OR r.expires_at > NOW()
        )
      ORDER BY
        CASE
          WHEN r.tenant_id = ?
          THEN 0
          ELSE 1
        END,
        s.priority ASC,
        r.effective_at DESC
      LIMIT 1
    `,
    [
      tenantId,
      tenantId,
      baseCurrency,
      quoteCurrency,
      tenantId,
    ]
  );

  return rows[0] || null;
};

const createSpreadRule = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO fx_spread_rules (
        id,
        tenant_id,
        code,
        name,
        base_currency,
        quote_currency,
        customer_segment,
        transaction_type,
        spread_type,
        spread_value,
        minimum_fee,
        maximum_fee,
        priority,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.baseCurrency || null,
      body.quoteCurrency || null,
      body.customerSegment || null,
      body.transactionType || null,
      body.spreadType,
      body.spreadValue,
      body.minimumFee ?? null,
      body.maximumFee ?? null,
      body.priority,
      body.status,
      createdBy,
    ]
  );

  return findSpreadRuleById({
    tenantId,
    ruleId: id,
  });
};

const findSpreadRuleById = async ({
  tenantId,
  ruleId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_spread_rules
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, ruleId]
  );

  return rows[0] || null;
};

const findApplicableSpreadRule = async ({
  tenantId,
  sourceCurrency,
  destinationCurrency,
  customerSegment,
  transactionType,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_spread_rules
      WHERE tenant_id = ?
        AND status = 'active'
        AND (
          base_currency IS NULL
          OR base_currency = ?
        )
        AND (
          quote_currency IS NULL
          OR quote_currency = ?
        )
        AND (
          customer_segment IS NULL
          OR customer_segment = ?
        )
        AND (
          transaction_type IS NULL
          OR transaction_type = ?
        )
      ORDER BY
        priority ASC,
        created_at ASC
      LIMIT 1
    `,
    [
      tenantId,
      sourceCurrency,
      destinationCurrency,
      customerSegment || null,
      transactionType || null,
    ]
  );

  return rows[0] || null;
};

const findQuoteByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_quotes
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const createQuote = async ({
  tenantId,
  userId,
  body,
  calculation,
}) => {
  const id = randomUUID();
  const reference =
    `FXQ-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO fx_quotes (
        id,
        tenant_id,
        user_id,
        quote_reference,
        idempotency_key,
        source_currency,
        destination_currency,
        source_amount,
        destination_amount,
        market_rate,
        customer_rate,
        spread_amount,
        fee_amount,
        rate_source_id,
        spread_rule_id,
        expires_at,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      reference,
      body.idempotencyKey,
      body.sourceCurrency,
      body.destinationCurrency,
      body.sourceAmount,
      calculation.destinationAmount,
      calculation.marketRate,
      calculation.customerRate,
      calculation.spreadAmount,
      calculation.feeAmount,
      calculation.rateSourceId,
      calculation.spreadRuleId || null,
      calculation.expiresAt,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findQuoteById({
    tenantId,
    quoteId: id,
  });
};

const findQuoteById = async ({
  tenantId,
  quoteId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_quotes
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, quoteId]
  );

  return rows[0] || null;
};

const findQuoteByIdForUpdate = async ({
  connection,
  tenantId,
  quoteId,
}) => {
  const [rows] =
    await connection.query(
      `
        SELECT *
        FROM fx_quotes
        WHERE tenant_id = ?
          AND id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [
        tenantId,
        quoteId,
      ]
    );

  return rows[0] || null;
};

const acceptQuote = async ({
  connection = db,
  tenantId,
  quoteId,
}) => {
  const [result] =
    await connection.query(
      `
        UPDATE fx_quotes
        SET
          status = 'accepted',
          accepted_at = NOW()
        WHERE tenant_id = ?
          AND id = ?
          AND status = 'active'
          AND expires_at > NOW()
      `,
      [
        tenantId,
        quoteId,
      ]
    );

  return result.affectedRows === 1;
};

const createConversion = async ({
  tenantId,
  userId,
  quote,
  body,
}) => {
  const id = randomUUID();
  const reference =
    `FXC-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO fx_conversions (
        id,
        tenant_id,
        user_id,
        fx_quote_id,
        conversion_reference,
        source_account_id,
        destination_account_id,
        source_ledger_account_id,
        destination_ledger_account_id,
        fx_position_ledger_account_id,
        fee_ledger_account_id,
        source_currency,
        destination_currency,
        source_amount,
        destination_amount,
        fee_amount,
        customer_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      quote.id,
      reference,
      body.sourceAccountId,
      body.destinationAccountId,
      body.sourceLedgerAccountId,
      body.destinationLedgerAccountId,
      body.fxPositionLedgerAccountId,
      body.feeLedgerAccountId || null,
      quote.source_currency,
      quote.destination_currency,
      quote.source_amount,
      quote.destination_amount,
      quote.fee_amount,
      quote.customer_rate,
    ]
  );

  return findConversionById({
    tenantId,
    conversionId: id,
  });
};

const findConversionById = async ({
  tenantId,
  conversionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_conversions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, conversionId]
  );

  return rows[0] || null;
};

const markConversionPosted = async ({
  tenantId,
  conversionId,
  journalId,
}) => {
  await db.query(
    `
      UPDATE fx_conversions
      SET
        status = 'posted',
        journal_id = ?,
        posted_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      journalId,
      tenantId,
      conversionId,
    ]
  );

  return findConversionById({
    tenantId,
    conversionId,
  });
};

const listRateSources = async ({
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_rate_sources
      WHERE tenant_id = ?
         OR tenant_id IS NULL
      ORDER BY
        CASE
          WHEN tenant_id = ? THEN 0
          ELSE 1
        END,
        priority ASC,
        created_at DESC
    `,
    [
      tenantId,
      tenantId,
    ]
  );

  return rows;
};

const listRates = async ({
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT
        r.*,
        s.code AS rate_source_code,
        s.name AS rate_source_name,
        s.provider_type,
        s.priority AS source_priority

      FROM fx_rates r

      INNER JOIN fx_rate_sources s
        ON s.id = r.rate_source_id

      WHERE (
        r.tenant_id = ?
        OR r.tenant_id IS NULL
      )
      AND (
        s.tenant_id = ?
        OR s.tenant_id IS NULL
      )

      ORDER BY
        CASE
          WHEN r.tenant_id = ? THEN 0
          ELSE 1
        END,
        r.base_currency ASC,
        r.quote_currency ASC,
        r.effective_at DESC
    `,
    [
      tenantId,
      tenantId,
      tenantId,
    ]
  );

  return rows;
};

const listSpreadRules = async ({
  tenantId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM fx_spread_rules
      WHERE tenant_id = ?
      ORDER BY
        priority ASC,
        created_at DESC
    `,
    [
      tenantId,
    ]
  );

  return rows;
};

module.exports = {
  createRateSource,
  findRateSourceById,
  createRate,
  findRateById,
  findBestRate,
  createSpreadRule,
  findSpreadRuleById,
  findApplicableSpreadRule,
  findQuoteByIdempotency,
  createQuote,
  findQuoteById,
  acceptQuote,
  createConversion,
  findConversionById,
  markConversionPosted,
  findQuoteByIdForUpdate,
  listRateSources,
  listRates,
  listSpreadRules,
};
