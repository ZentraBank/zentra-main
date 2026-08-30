const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createPartnerApplication = async ({
  tenantId,
  body,
  clientId,
  clientSecretHash,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO partner_applications (
        id,
        tenant_id,
        partner_name,
        application_name,
        application_type,
        client_id,
        client_secret_hash,
        public_key,
        jwks_uri,
        redirect_uris,
        environment,
        status,
        contact_name,
        contact_email,
        ip_allowlist,
        metadata,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.partnerName,
      body.applicationName,
      body.applicationType,
      clientId,
      clientSecretHash,
      body.publicKey || null,
      body.jwksUri || null,
      body.redirectUris
        ? JSON.stringify(body.redirectUris)
        : null,
      body.environment,
      body.status,
      body.contactName || null,
      body.contactEmail || null,
      body.ipAllowlist
        ? JSON.stringify(body.ipAllowlist)
        : null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
      createdBy,
    ]
  );

  return findPartnerById({
    tenantId,
    partnerId: id,
  });
};

const findPartnerById = async ({
  tenantId,
  partnerId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM partner_applications
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, partnerId]
  );

  return rows[0] || null;
};

const findPartnerByClientId = async ({
  tenantId,
  clientId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM partner_applications
      WHERE tenant_id = ?
        AND client_id = ?
      LIMIT 1
    `,
    [tenantId, clientId]
  );

  return rows[0] || null;
};

const approvePartner = async ({
  tenantId,
  partnerId,
  approvedBy,
}) => {
  await db.query(
    `
      UPDATE partner_applications
      SET
        status = 'active',
        approved_by = ?,
        approved_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'pending'
    `,
    [approvedBy, tenantId, partnerId]
  );

  return findPartnerById({
    tenantId,
    partnerId,
  });
};

const replaceScopes = async ({
  tenantId,
  partnerId,
  scopes,
  grantedBy,
}) => {
  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
        DELETE FROM partner_application_scopes
        WHERE tenant_id = ?
          AND partner_application_id = ?
      `,
      [tenantId, partnerId]
    );

    for (const scope of scopes) {
      await connection.query(
        `
          INSERT INTO partner_application_scopes (
            id,
            tenant_id,
            partner_application_id,
            scope_code,
            granted_by
          ) VALUES (?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          tenantId,
          partnerId,
          scope,
          grantedBy,
        ]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return listPartnerScopes({
    tenantId,
    partnerId,
  });
};

const listPartnerScopes = async ({
  tenantId,
  partnerId,
}) => {
  const [rows] = await db.query(
    `
      SELECT scope_code
      FROM partner_application_scopes
      WHERE tenant_id = ?
        AND partner_application_id = ?
        AND status = 'active'
      ORDER BY scope_code ASC
    `,
    [tenantId, partnerId]
  );

  return rows.map((row) => row.scope_code);
};

const createAccessToken = async ({
  tenantId,
  partnerId,
  tokenHash,
  scopes,
  expiresAt,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO api_access_tokens (
        id,
        tenant_id,
        partner_application_id,
        token_hash,
        scopes,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      partnerId,
      tokenHash,
      JSON.stringify(scopes),
      expiresAt,
    ]
  );

  return {
    id,
    expiresAt,
  };
};

const findAccessTokenByHash = async ({
  tokenHash,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM api_access_tokens
      WHERE token_hash = ?
        AND status = 'active'
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};

const createConsent = async ({
  tenantId,
  userId,
  partnerId,
  body,
}) => {
  const id = randomUUID();
  const reference =
    `CNS-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO open_banking_consents (
        id,
        tenant_id,
        user_id,
        partner_application_id,
        consent_reference,
        consent_type,
        scopes,
        account_ids,
        expires_at,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      userId,
      partnerId,
      reference,
      body.consentType,
      JSON.stringify(body.scopes),
      body.accountIds
        ? JSON.stringify(body.accountIds)
        : null,
      body.expiresAt,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findConsentById({
    tenantId,
    consentId: id,
  });
};

const findConsentById = async ({
  tenantId,
  consentId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM open_banking_consents
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, consentId]
  );

  return rows[0] || null;
};

const authoriseConsent = async ({
  tenantId,
  consentId,
  scaReference,
}) => {
  await db.query(
    `
      UPDATE open_banking_consents
      SET
        status = 'authorised',
        authorised_at = NOW(),
        strong_customer_authentication_reference = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status = 'pending'
        AND expires_at > NOW()
    `,
    [scaReference, tenantId, consentId]
  );

  return findConsentById({
    tenantId,
    consentId,
  });
};

const revokeConsent = async ({
  tenantId,
  consentId,
  reason,
}) => {
  await db.query(
    `
      UPDATE open_banking_consents
      SET
        status = 'revoked',
        revoked_at = NOW(),
        revocation_reason = ?
      WHERE tenant_id = ?
        AND id = ?
        AND status IN (
          'pending',
          'authorised'
        )
    `,
    [reason || null, tenantId, consentId]
  );

  return findConsentById({
    tenantId,
    consentId,
  });
};

const createWebhookSubscription = async ({
  tenantId,
  partnerId,
  body,
  signingSecretHash,
  createdBy,
}) => {
  const id = randomUUID();
  const reference =
    `WHK-${Date.now()}-${id.slice(0, 8)}`;

  await db.query(
    `
      INSERT INTO partner_webhook_subscriptions (
        id,
        tenant_id,
        partner_application_id,
        subscription_reference,
        endpoint_url,
        event_types,
        signing_secret_hash,
        signing_algorithm,
        status,
        max_attempts,
        timeout_seconds,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      partnerId,
      reference,
      body.endpointUrl,
      JSON.stringify(body.eventTypes),
      signingSecretHash,
      body.signingAlgorithm,
      body.status,
      body.maxAttempts,
      body.timeoutSeconds,
      createdBy,
    ]
  );

  return findWebhookSubscriptionById({
    tenantId,
    subscriptionId: id,
  });
};

const findWebhookSubscriptionById = async ({
  tenantId,
  subscriptionId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM partner_webhook_subscriptions
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, subscriptionId]
  );

  return rows[0] || null;
};

const createRateLimitPolicy = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO api_rate_limit_policies (
        id,
        tenant_id,
        policy_code,
        name,
        partner_application_id,
        route_pattern,
        requests_per_window,
        window_seconds,
        burst_limit,
        status,
        priority,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.policyCode,
      body.name,
      body.partnerApplicationId || null,
      body.routePattern || null,
      body.requestsPerWindow,
      body.windowSeconds,
      body.burstLimit ?? null,
      body.status,
      body.priority,
      createdBy,
    ]
  );

  return findRateLimitPolicyById({
    tenantId,
    policyId: id,
  });
};

const findRateLimitPolicyById = async ({
  tenantId,
  policyId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM api_rate_limit_policies
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, policyId]
  );

  return rows[0] || null;
};

const logPartnerRequest = ({
  tenantId,
  partnerId,
  requestId,
  method,
  path,
  scopes,
  ipAddress,
  userAgent,
  requestHash,
  responseStatus,
  durationMs,
  errorCode,
  errorMessage,
}) =>
  db.query(
    `
      INSERT INTO partner_api_request_logs (
        id,
        tenant_id,
        partner_application_id,
        request_id,
        method,
        path,
        scopes,
        ip_address,
        user_agent,
        request_hash,
        response_status,
        duration_ms,
        error_code,
        error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      partnerId,
      requestId,
      method,
      path,
      scopes ? JSON.stringify(scopes) : null,
      ipAddress || null,
      userAgent || null,
      requestHash || null,
      responseStatus,
      durationMs || null,
      errorCode || null,
      errorMessage || null,
    ]
  );

module.exports = {
  createPartnerApplication,
  findPartnerById,
  findPartnerByClientId,
  approvePartner,
  replaceScopes,
  listPartnerScopes,
  createAccessToken,
  findAccessTokenByHash,
  createConsent,
  findConsentById,
  authoriseConsent,
  revokeConsent,
  createWebhookSubscription,
  findWebhookSubscriptionById,
  createRateLimitPolicy,
  findRateLimitPolicyById,
  logPartnerRequest,
};
