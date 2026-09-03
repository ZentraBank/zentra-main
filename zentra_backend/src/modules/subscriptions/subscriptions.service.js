const repo = require("./subscriptions.repository");
const {
  storePrivateFile,
} = require(
  "../../services/private-file.service"
);

const platformAuthRepository = require(
  "../platform-auth/platform-auth.repository"
);

const platformNotificationsService = require(
  "../platform-notifications/platform-notifications.service"
);



const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/*
|--------------------------------------------------------------------------
| Shared request creation
|--------------------------------------------------------------------------
|
| Used by both:
| - authenticated subscription upgrades
| - onboarding subscription requests
|
*/

const createSubscriptionRequest = async ({
  tenantId,
  userId,
  planCode
}) => {
 const plan = await repo.findPlanByCode({
  planCode
});

  if (!plan) {
    throw httpError(
      404,
      "Subscription plan not found"
    );
  }

  const openRequest =
    await repo.findOpenRequest({
      tenantId,
      userId
    });

  if (openRequest) {
    throw httpError(
      409,
      "You already have an open subscription request"
    );
  }

  const activeSubscription =
    await repo.findActiveSubscription({
      tenantId,
      userId
    });

  if (
    activeSubscription?.plan_id ===
    plan.id
  ) {
    throw httpError(
      409,
      "You are already subscribed to this plan"
    );
  }

  return repo.createRequest({
    tenantId,
    userId,
    planId: plan.id
  });
};

/*
|--------------------------------------------------------------------------
| Shared payment proof submission
|--------------------------------------------------------------------------
*/

const submitSubscriptionProof =
  async ({
    tenantId,
    userId,
    requestId,
    body,
  }) => {
    const request =
      await repo.findRequestById({
        tenantId,
        requestId,
      });

    if (
      !request ||
      request.user_id !==
        userId
    ) {
      throw httpError(
        404,
        "Subscription request not found"
      );
    }

    if (
      request.status !==
      "pending_payment"
    ) {
      throw httpError(
        409,
        "Payment proof cannot be submitted for this subscription request"
      );
    }

    const proofFile =
      await repo.findPrivateFileById({
        tenantId,
        fileId:
          body.paymentProofFileId,
      });

    if (
      !proofFile ||
      proofFile.user_id !==
        userId ||
      proofFile.module !==
        "subscriptions" ||
      proofFile.document_type !==
        "payment_proof"
    ) {
      throw httpError(
        422,
        "Payment proof file is invalid"
      );
    }

    const updated =
      await repo.submitProof({
        tenantId,
        userId,
        requestId,

        paymentReference:
          body.paymentReference,

        paymentProofFileId:
          body.paymentProofFileId,

        paymentNote:
          body.paymentNote,
      });

    if (!updated) {
      throw httpError(
        409,
        "Payment proof cannot be submitted"
      );
    }
    try {
  console.log(
    "=== PAYMENT PROOF NOTIFICATION START ==="
  );

  console.log(
    "tenantId:",
    tenantId
  );

  console.log(
    "requestId:",
    requestId
  );

  console.log(
    "platformAuthRepository has function:",
    typeof platformAuthRepository
      .listActiveUsersWithPermission
  );

  console.log(
    "platformNotificationsService has function:",
    typeof platformNotificationsService
      .createNotification
  );

  const reviewers =
    await platformAuthRepository
      .listActiveUsersWithPermission(
        "platform.subscriptions.update"
      );

  console.log(
    "REVIEWERS:",
    reviewers
  );

  const recipientUserIds =
    reviewers.map(
      (reviewer) => reviewer.id
    );

  console.log(
    "RECIPIENT IDS:",
    recipientUserIds
  );

  if (!recipientUserIds.length) {
    console.log(
      "NO RECIPIENTS FOUND"
    );
  } else {
    const notificationResult =
      await platformNotificationsService
        .createNotification({
          body: {
            type:
              "subscription_payment_proof",

            severity:
              "info",

            title:
              "New payment proof submitted",

            message:
              "A new subscription payment proof has been submitted and is awaiting review.",

            tenantId,

            entityType:
              "subscription_request",

            entityId:
              requestId,

            recipientUserIds,
          },
        });

    console.log(
      "NOTIFICATION RESULT:",
      notificationResult
    );
  }

  console.log(
    "=== PAYMENT PROOF NOTIFICATION END ==="
  );
} catch (error) {
  console.error(
    "=== PAYMENT PROOF NOTIFICATION ERROR ==="
  );

  console.error(
    "name:",
    error?.name
  );

  console.error(
    "message:",
    error?.message
  );

  console.error(
    "code:",
    error?.code
  );

  console.error(
    "sqlMessage:",
    error?.sqlMessage
  );

  console.error(error);
}

  
    return repo.findRequestById({
      tenantId,
      requestId,
    });
  };

/*
|--------------------------------------------------------------------------
| Plans
|--------------------------------------------------------------------------
*/

const listPlans = () =>
  repo.listPlans();

/*
|--------------------------------------------------------------------------
| Current authenticated subscription
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Subscription entitlement helpers
|--------------------------------------------------------------------------
*/

const LIMIT_FEATURES =
  new Set([
    "transfer_limit",
    "daily_transfer_limit",
    "number_of_accounts",
  ]);

const parseFeatureValue = (
  feature
) => {
  const key =
    feature.feature_key;

  /*
  |--------------------------------------------------------------------------
  | Disabled
  |--------------------------------------------------------------------------
  */

  if (!Boolean(feature.is_enabled)) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | SQL NULL
  |--------------------------------------------------------------------------
  |
  | For limits:
  |   null = unlimited by subscription
  |
  | For normal boolean features:
  |   enabled + null = true
  |
  */

  if (
    feature.feature_value === null ||
    feature.feature_value === undefined
  ) {
    return LIMIT_FEATURES.has(key)
      ? null
      : true;
  }

  try {
    return JSON.parse(
      feature.feature_value
    );
  } catch {
    return feature.feature_value;
  }
};

/*
|--------------------------------------------------------------------------
| Resolve tenant subscription entitlements
|--------------------------------------------------------------------------
|
| Subscription access belongs to the tenant, not the individual staff user.
|
| Role permissions answer:
|   "May this user perform the action?"
|
| Entitlements answer:
|   "Has this tenant's plan purchased the feature?"
|
*/

const getTenantEntitlements = async ({
  tenantId,
}) => {
  const subscription =
    await repo.findActiveTenantSubscription({
      tenantId,
    });

  /*
  |--------------------------------------------------------------------------
  | No active subscription
  |--------------------------------------------------------------------------
  */

  if (!subscription) {
    return {
      subscription: null,
      entitlements: {},
    };
  }

  const features =
    await repo.listPlanFeatures({
      planId:
        subscription.plan_id,
    });

  const entitlements = {};

  for (const feature of features) {
    entitlements[
      feature.feature_key
    ] =
      parseFeatureValue(
        feature
      );
  }

  return {
    subscription,
    entitlements,
  };
};

const getMine = async ({
  tenantId,
  userId,
}) => {
  const [
    tenantAccess,
    openRequest,
  ] =
    await Promise.all([
      getTenantEntitlements({
        tenantId,
      }),

      repo.findOpenRequest({
        tenantId,
        userId,
      }),
    ]);

  return {
    subscription:
      tenantAccess.subscription,

    entitlements:
      tenantAccess.entitlements,

    openRequest,
  };
};

/*
|--------------------------------------------------------------------------
| Authenticated upgrade request
|--------------------------------------------------------------------------
*/

const startUpgrade = async ({
  tenantId,
  userId,
  planCode
}) =>
  createSubscriptionRequest({
    tenantId,
    userId,
    planCode
  });

/*
|--------------------------------------------------------------------------
| Authenticated payment proof
|--------------------------------------------------------------------------
*/

const submitProof = async ({
  auth,
  requestId,
  body
}) =>
  submitSubscriptionProof({
    tenantId: auth.tenantId,
    userId: auth.userId,
    requestId,
    body
  });

/*
|--------------------------------------------------------------------------
| Onboarding token resolver
|--------------------------------------------------------------------------
|
| Expected repository method:
|
| repo.findOnboardingSession({
|   tokenHash
| })
|
| The onboarding token should resolve to:
|
| {
|   tenant_id,
|   user_id,
|   expires_at,
|   consumed_at
| }
|
| We hash the raw browser token before looking it up.
|
*/

const resolveOnboardingToken = async (
  onboardingToken
) => {
  if (
    !onboardingToken ||
    typeof onboardingToken !== "string"
  ) {
    throw httpError(
      401,
      "Onboarding token is required"
    );
  }

  const crypto = require("crypto");

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(
        onboardingToken.trim()
      )
      .digest("hex");

  const onboarding =
    await repo.findOnboardingSession({
      tokenHash
    });

  if (!onboarding) {
    throw httpError(
      401,
      "Onboarding session is invalid or has expired"
    );
  }

  if (onboarding.consumed_at) {
    throw httpError(
      401,
      "Onboarding session has already been used"
    );
  }

  return {
    tenantId:
      onboarding.tenant_id,

    userId:
      onboarding.user_id
  };
};

/*
|--------------------------------------------------------------------------
| Start subscription during onboarding
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Upload onboarding payment proof
|--------------------------------------------------------------------------
*/

const uploadOnboardingPaymentProof =
  async ({
    onboardingToken,
    file,
  }) => {
    const onboarding =
      await resolveOnboardingToken(
        onboardingToken
      );

    if (!file) {
      throw httpError(
        422,
        "Payment proof file is required"
      );
    }

    const stored =
      await storePrivateFile({
        tenantId:
          onboarding.tenantId,

        userId:
          onboarding.userId,

        module:
          "subscriptions",

        documentType:
          "payment_proof",

        file,
      });

    try {
      const record =
        await repo.createPrivateFileRecord({
          id:
            stored.id,

          tenantId:
            onboarding.tenantId,

          userId:
            onboarding.userId,

          module:
            "subscriptions",

          documentType:
            "payment_proof",

          originalName:
            stored.originalName,

          storedName:
            stored.storedName,

          mimeType:
            stored.mimeType,

          sizeBytes:
            stored.sizeBytes,

          storagePath:
            stored.storagePath,
        });

      return {
        fileId:
          record.id,

        documentType:
          record.document_type,

        originalName:
          record.original_name,

        mimeType:
          record.mime_type,

        sizeBytes:
          Number(
            record.size_bytes
          ),
      };
    } catch (error) {
      /*
       * The physical file has already been
       * written at this point.
       *
       * We will improve cleanup of orphaned
       * files separately if necessary.
       */

      throw error;
    }
  };

const startOnboardingSubscription =
  async ({
    onboardingToken,
    planCode
  }) => {
    const onboarding =
      await resolveOnboardingToken(
        onboardingToken
      );

    return createSubscriptionRequest({
      tenantId:
        onboarding.tenantId,

      userId:
        onboarding.userId,

      planCode
    });
  };

/*
|--------------------------------------------------------------------------
| Submit payment proof during onboarding
|--------------------------------------------------------------------------
*/

const submitOnboardingProof =
  async ({
    onboardingToken,
    requestId,
    body
  }) => {
    const onboarding =
      await resolveOnboardingToken(
        onboardingToken
      );

    return submitSubscriptionProof({
      tenantId:
        onboarding.tenantId,

      userId:
        onboarding.userId,

      requestId,

      body
    });
  };

/*
|--------------------------------------------------------------------------
| Onboarding subscription status
|--------------------------------------------------------------------------
*/

const getOnboardingStatus =
  async ({
    onboardingToken
  }) => {
    const onboarding =
      await resolveOnboardingToken(
        onboardingToken
      );

    const activeSubscription =
      await repo.findActiveSubscription({
        tenantId:
          onboarding.tenantId,

        userId:
          onboarding.userId
      });

    const openRequest =
      await repo.findOpenRequest({
        tenantId:
          onboarding.tenantId,

        userId:
          onboarding.userId
      });

    return {
      subscription:
        activeSubscription,

      openRequest
    };
  };

/*
|--------------------------------------------------------------------------
| Admin pending requests
|--------------------------------------------------------------------------
*/

const listPending = ({
  tenantId,
  page,
  pageSize
}) => {
  const safePage =
    Number.isFinite(page) &&
    page > 0
      ? page
      : 1;

  const safePageSize =
    Number.isFinite(pageSize) &&
    pageSize > 0
      ? Math.min(
          pageSize,
          100
        )
      : 20;

  return repo.listPending({
    tenantId,

    limit:
      safePageSize,

    offset:
      (safePage - 1) *
      safePageSize
  });
};

/*
|--------------------------------------------------------------------------
| Approve subscription
|--------------------------------------------------------------------------
*/

const approve = async ({
  auth,
  requestId,
  durationDays
}) => {
  if (
    !Number.isFinite(durationDays) ||
    durationDays <= 0
  ) {
    throw httpError(
      400,
      "Valid subscription duration is required"
    );
  }

  const connection =
    await repo.db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const request =
      await repo.findRequestById({
        tenantId:
          auth.tenantId,

        requestId,

        connection,

        forUpdate: true
      });

    if (!request) {
      throw httpError(
        404,
        "Subscription request not found"
      );
    }

    if (
      request.status !==
      "payment_submitted"
    ) {
      throw httpError(
        409,
        "Only submitted payments can be approved"
      );
    }

    await repo.expireActive({
      connection,

      tenantId:
        auth.tenantId,

      userId:
        request.user_id
    });

    const startsAt =
      new Date();

    const expiresAt =
      new Date(
        startsAt.getTime() +
          durationDays *
            86400000
      );

    await repo.createSubscription({
      connection,

      tenantId:
        auth.tenantId,

      userId:
        request.user_id,

      planId:
        request.plan_id,

      startsAt,
      expiresAt
    });

    await repo.approveRequest({
      connection,

      tenantId:
        auth.tenantId,

      requestId,

      reviewerUserId:
        auth.userId
    });

    await connection.commit();

    return repo.findRequestById({
      tenantId:
        auth.tenantId,

      requestId
    });
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Reject subscription
|--------------------------------------------------------------------------
*/

const reject = async ({
  auth,
  requestId,
  reason
}) => {
  const request =
    await repo.findRequestById({
      tenantId:
        auth.tenantId,

      requestId
    });

  if (!request) {
    throw httpError(
      404,
      "Subscription request not found"
    );
  }

  const ok =
    await repo.rejectRequest({
      tenantId:
        auth.tenantId,

      requestId,

      reviewerUserId:
        auth.userId,

      reason
    });

  if (!ok) {
    throw httpError(
      409,
      "Only submitted payments can be rejected"
    );
  }

  return repo.findRequestById({
    tenantId:
      auth.tenantId,

    requestId
  });
};

module.exports = {
  listPlans,

  getMine,
  getTenantEntitlements,

  startUpgrade,
  submitProof,

  uploadOnboardingPaymentProof,
  startOnboardingSubscription,
  submitOnboardingProof,
  getOnboardingStatus,

  listPending,
  approve,
  reject,
};