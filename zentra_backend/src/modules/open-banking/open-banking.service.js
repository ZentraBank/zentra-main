const crypto =
  require("crypto");

const bcrypt =
  require("bcryptjs");

const repo =
  require("./open-banking.repository");

const eventsService =
  require("../events/events.service");

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const randomSecret = (
  bytes = 32
) =>
  crypto
    .randomBytes(bytes)
    .toString("base64url");

const sha256 = (
  value
) =>
  crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");

const createPartnerApplication = async ({
  auth,
  body,
}) => {
  const clientId =
    `zb_${body.environment}_${randomSecret(18)}`;

  const clientSecret =
    randomSecret(40);

  const clientSecretHash =
    await bcrypt.hash(
      clientSecret,
      12
    );

  const partner =
    await repo
      .createPartnerApplication({
        tenantId:
          auth.tenantId,

        body,

        clientId,

        clientSecretHash,

        createdBy:
          auth.userId,
      });

  await repo.replaceScopes({
    tenantId:
      auth.tenantId,

    partnerId:
      partner.id,

    scopes:
      body.scopes,

    grantedBy:
      auth.userId,
  });

  return {
    partner,
    credentials: {
      clientId,
      clientSecret,
    },
  };
};

const approvePartner = async ({
  auth,
  partnerId,
}) => {
  const partner =
    await repo.findPartnerById({
      tenantId:
        auth.tenantId,
      partnerId,
    });

  if (!partner) {
    throw httpError(
      404,
      "Partner application not found"
    );
  }

  if (
    partner.status !==
    "pending"
  ) {
    throw httpError(
      409,
      "Only pending partner applications can be approved"
    );
  }

  return repo.approvePartner({
    tenantId:
      auth.tenantId,
    partnerId,
    approvedBy:
      auth.userId,
  });
};

const issueClientCredentialsToken =
  async ({
    tenantId,
    body,
  }) => {
    const partner =
      await repo.findPartnerByClientId({
        tenantId,
        clientId:
          body.clientId,
      });

    if (
      !partner ||
      partner.status !==
      "active"
    ) {
      throw httpError(
        401,
        "Invalid client credentials"
      );
    }

    const validSecret =
      await bcrypt.compare(
        body.clientSecret,
        partner.client_secret_hash
      );

    if (!validSecret) {
      throw httpError(
        401,
        "Invalid client credentials"
      );
    }

    const grantedScopes =
      await repo.listPartnerScopes({
        tenantId,
        partnerId:
          partner.id,
      });

    const requestedScopes =
      body.scopes?.length
        ? body.scopes
        : grantedScopes;

    const invalidScope =
      requestedScopes.find(
        (scope) =>
          !grantedScopes.includes(
            scope
          )
      );

    if (invalidScope) {
      throw httpError(
        403,
        `Scope not granted: ${invalidScope}`
      );
    }

    const accessToken =
      randomSecret(48);

    const expiresAt =
      new Date(
        Date.now() +
        body.expiresInSeconds *
          1000
      );

    await repo.createAccessToken({
      tenantId,
      partnerId:
        partner.id,
      tokenHash:
        sha256(accessToken),
      scopes:
        requestedScopes,
      expiresAt,
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn:
        body.expiresInSeconds,
      scopes:
        requestedScopes,
    };
  };

const createConsent = async ({
  auth,
  partnerId,
  body,
}) => {
  const partner =
    await repo.findPartnerById({
      tenantId:
        auth.tenantId,
      partnerId,
    });

  if (
    !partner ||
    partner.status !==
      "active"
  ) {
    throw httpError(
      404,
      "Active partner application not found"
    );
  }

  const consent =
    await repo.createConsent({
      tenantId:
        auth.tenantId,
      userId:
        auth.userId,
      partnerId,
      body,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "open_banking.consent_created",
    aggregateType:
      "open_banking_consent",
    aggregateId:
      consent.id,
    idempotencyKey:
      `consent:${consent.id}:created:v1`,
    payload: {
      consentId:
        consent.id,
      reference:
        consent.consent_reference,
      consentType:
        consent.consent_type,
      partnerApplicationId:
        consent.partner_application_id,
      expiresAt:
        consent.expires_at,
    },
  });

  return consent;
};

const authoriseConsent = async ({
  auth,
  consentId,
  body,
}) => {
  const consent =
    await repo.findConsentById({
      tenantId:
        auth.tenantId,
      consentId,
    });

  if (!consent) {
    throw httpError(
      404,
      "Open Banking consent not found"
    );
  }

  if (
    consent.user_id !==
    auth.userId
  ) {
    throw httpError(
      403,
      "Consent does not belong to the authenticated user"
    );
  }

  if (
    consent.status !==
    "pending"
  ) {
    throw httpError(
      409,
      "Consent has already been processed"
    );
  }

  return repo.authoriseConsent({
    tenantId:
      auth.tenantId,
    consentId,
    scaReference:
      body.scaReference,
  });
};

const revokeConsent = async ({
  auth,
  consentId,
  body,
}) => {
  const consent =
    await repo.findConsentById({
      tenantId:
        auth.tenantId,
      consentId,
    });

  if (!consent) {
    throw httpError(
      404,
      "Open Banking consent not found"
    );
  }

  if (
    consent.user_id !==
      auth.userId &&
    !auth.permissions?.includes(
      "open_banking.consents.manage"
    )
  ) {
    throw httpError(
      403,
      "Not authorised to revoke this consent"
    );
  }

  return repo.revokeConsent({
    tenantId:
      auth.tenantId,
    consentId,
    reason:
      body.reason,
  });
};

const createWebhookSubscription = async ({
  auth,
  partnerId,
  body,
}) => {
  const partner =
    await repo.findPartnerById({
      tenantId:
        auth.tenantId,
      partnerId,
    });

  if (!partner) {
    throw httpError(
      404,
      "Partner application not found"
    );
  }

  const signingSecret =
    randomSecret(40);

  const signingSecretHash =
    await bcrypt.hash(
      signingSecret,
      12
    );

  const subscription =
    await repo
      .createWebhookSubscription({
        tenantId:
          auth.tenantId,
        partnerId,
        body,
        signingSecretHash,
        createdBy:
          auth.userId,
      });

  return {
    subscription,
    signingSecret,
  };
};

module.exports = {
  createPartnerApplication,
  approvePartner,
  issueClientCredentialsToken,
  createConsent,
  authoriseConsent,
  revokeConsent,
  createWebhookSubscription,

  createRateLimitPolicy:
    ({ auth, body }) =>
      repo.createRateLimitPolicy({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),
};
