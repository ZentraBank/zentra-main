const db = require("../../config/db");
const repo = require("./platform-subscriptions.repository");

const {
  readPrivateFile,
} = require("../../services/private-file.service");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getPlan = async (planId) => {
  const plan = await repo.findPlanById(planId);

  if (!plan) {
    throw httpError(404, "Subscription plan not found.");
  }

  return {
    ...plan,
    features: await repo.listPlanFeatures(planId),
  };
};

const createPlan = async ({
  auth,
  body,
}) => {
  const existing =
    await repo.findPlanByCode(body.code);

  if (existing) {
    throw httpError(
      409,
      "A subscription plan with this code already exists."
    );
  }

  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const planId = await repo.createPlan({
      connection,
      body,
      actorUserId: auth.userId,
    });

    await repo.replacePlanFeatures({
      connection,
      planId,
      features: body.features || [],
    });

    await connection.commit();

    return getPlan(planId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updatePlanFeatures = async ({
  planId,
  features,
}) => {
  const plan =
    await repo.findPlanById(planId);

  if (!plan) {
    throw httpError(
      404,
      "Subscription plan not found."
    );
  }

  if (!Array.isArray(features)) {
    throw httpError(
      400,
      "Features must be an array."
    );
  }

  const existingFeatures =
    await repo.listPlanFeatures(planId);

  const existingByKey =
    new Map(
      existingFeatures.map(
        (feature) => [
          feature.feature_key,
          feature,
        ]
      )
    );

  for (const feature of features) {
    const featureKey =
      feature.featureKey ??
      feature.featureCode;

    if (!featureKey) {
      throw httpError(
        400,
        "Every feature must have a feature key."
      );
    }

    if (!existingByKey.has(featureKey)) {
      throw httpError(
        400,
        `Unknown plan feature "${featureKey}".`
      );
    }

    const current =
      existingByKey.get(featureKey);

    existingByKey.set(
      featureKey,
      {
        featureKey,
        isEnabled:
          feature.isEnabled ??
          feature.is_enabled ??
          Boolean(current.is_enabled),

        featureValue:
          feature.featureValue ??
          feature.value ??
          current.feature_value ??
          null,
      }
    );
  }

  const mergedFeatures =
    Array.from(
      existingByKey.values()
    ).map((feature) => ({
      featureKey:
        feature.featureKey ??
        feature.feature_key,

      isEnabled:
        feature.isEnabled ??
        Boolean(feature.is_enabled),

      featureValue:
        feature.featureValue ??
        feature.feature_value ??
        null,
    }));

  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    await repo.replacePlanFeatures({
      connection,
      planId,
      features: mergedFeatures,
    });

    await connection.commit();

    return getPlan(planId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const changeTenantPlan = async ({
  auth,
  tenantId,
  planId,
  action,
  reason,
}) => {
  /*
   * Validate target plan first.
   */
  const plan =
    await repo.findPlanById(planId);

  if (
    !plan ||
    plan.status !== "active"
  ) {
    throw httpError(
      409,
      "The selected subscription plan is not active."
    );
  }

  /*
   * Check whether the tenant already
   * has a subscription.
   */
  const subscription =
    await repo.findTenantSubscription(
      tenantId
    );

  /*
   * ---------------------------------------------------------
   * FIRST SUBSCRIPTION ASSIGNMENT
   * ---------------------------------------------------------
   */
  if (!subscription) {
    const connection =
      await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
       * user_subscriptions still requires
       * a user_id, so resolve the tenant's
       * primary administrator.
       */
      const tenantAdmin =
        await repo.findTenantPrimaryAdmin({
          tenantId,
          connection,
        });

      if (!tenantAdmin) {
        throw httpError(
          409,
          "No active tenant administrator was found for this tenant."
        );
      }

      /*
       * Create the tenant's first
       * commercial subscription.
       */
      const subscriptionId =
        await repo.createInitialTenantSubscription({
          connection,
          tenantId,
          userId:
            tenantAdmin.id,
          planId,
        });

      await connection.commit();

      /*
       * Record assignment history.
       */
      await repo.createSubscriptionHistory({
        tenantId,
        subscriptionId,

        previousPlanId:
          null,

        newPlanId:
          planId,

        action:
          "assigned",

        previousStatus:
          null,

        newStatus:
          "active",

        reason:
          reason ||
          `Assigned ${plan.name} subscription plan.`,

        actorUserId:
          auth.userId,
      });

      return repo.findTenantSubscription(
        tenantId
      );
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  }

  /*
   * ---------------------------------------------------------
   * EXISTING SUBSCRIPTION
   * ---------------------------------------------------------
   */

  if (
    subscription.plan_id ===
    planId
  ) {
    throw httpError(
      409,
      "The tenant is already using this subscription plan."
    );
  }

  if (
    action !== "upgraded" &&
    action !== "downgraded"
  ) {
    throw httpError(
      400,
      "Existing subscriptions must be upgraded or downgraded."
    );
  }

  const updated =
    await repo.updateTenantSubscription({
      tenantId,

      subscriptionId:
        subscription.id,

      planId,
    });

  await repo.createSubscriptionHistory({
    tenantId,

    subscriptionId:
      subscription.id,

    previousPlanId:
      subscription.plan_id,

    newPlanId:
      planId,

    action,

    previousStatus:
      subscription.status,

    newStatus:
      subscription.status,

    reason,

    actorUserId:
      auth.userId,
  });

  return updated;
};

const changeTenantSubscriptionStatus = async ({
  auth,
  tenantId,
  status,
  action,
  reason,
}) => {
  const subscription =
    await repo.findTenantSubscription(tenantId);

  if (!subscription) {
    throw httpError(
      404,
      "Tenant subscription not found."
    );
  }

  const transitions = {
    active: ["suspended", "cancelled", "expired"],
    suspended: ["active", "cancelled"],
    cancelled: ["active"],
    expired: ["active"],
    past_due: ["active", "suspended", "cancelled"],
  };

  if (
    !(transitions[subscription.status] || []).includes(status)
  ) {
    throw httpError(
      409,
      `Cannot change subscription from ${subscription.status} to ${status}.`
    );
  }

  const updated =
    await repo.updateTenantSubscription({
      tenantId,
      subscriptionId: subscription.id,
      status,
    });

  await repo.createSubscriptionHistory({
    tenantId,
    subscriptionId: subscription.id,
    previousPlanId: subscription.plan_id,
    newPlanId: subscription.plan_id,
    action,
    previousStatus: subscription.status,
    newStatus: status,
    reason,
    actorUserId: auth.userId,
  });

  return updated;
};

const renewTenantSubscription = async ({
  auth,
  tenantId,
  expiresAt,
  reason,
}) => {
  const subscription =
    await repo.findTenantSubscription(tenantId);

  if (!subscription) {
    throw httpError(
      404,
      "Tenant subscription not found."
    );
  }

const updated =
  await repo.updateTenantSubscription({
    tenantId,
    subscriptionId: subscription.id,
    status: "active",
    startsAt: new Date(),
    expiresAt,
  });

  await repo.createSubscriptionHistory({
    tenantId,
    subscriptionId: subscription.id,
    previousPlanId: subscription.plan_id,
    newPlanId: subscription.plan_id,
    action: "renewed",
    previousStatus: subscription.status,
    newStatus: "active",
    reason,
    actorUserId: auth.userId,
  });

  return updated;
};

const listRequests = async ({
  query,
}) => {
  return repo.listSubscriptionRequests({
    page: Number(query.page || 1),

    limit: Math.min(
      Number(query.limit || 20),
      100
    ),

    status: query.status,

    search: query.search,
  });
};

const getRequest = async ({
  requestId,
}) => {
  const request =
    await repo.findSubscriptionRequestById({
      requestId,
    });

  if (!request) {
    throw httpError(
      404,
      "Subscription payment request not found."
    );
  }

  return request;
};

const getPaymentProof = async ({
  requestId,
}) => {
  const request =
    await repo.findSubscriptionRequestById({
      requestId,
    });

  if (!request) {
    throw httpError(
      404,
      "Subscription payment request not found."
    );
  }

  if (!request.payment_proof_file_id) {
    throw httpError(
      404,
      "No payment proof has been uploaded for this request."
    );
  }

  const proof =
    await repo.findSubscriptionPaymentProof({
      requestId,
    });

  if (!proof) {
    throw httpError(
      404,
      "Payment proof file not found."
    );
  }

  const buffer =
    await readPrivateFile({
      storagePath: proof.storage_path,
    });

  return {
    id: proof.id,
    originalName: proof.original_name,
    mimeType: proof.mime_type,
    sizeBytes: Number(
      proof.size_bytes || 0
    ),
    buffer,
  };
};

const approveRequest = async ({
  
  auth,
  requestId,
  durationDays,
}) => {
  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Lock the payment request
    |--------------------------------------------------------------------------
    */

    const request =
      await repo.findSubscriptionRequestById({
        requestId,
        connection,
        forUpdate: true,
      });

    if (!request) {
      throw httpError(
        404,
        "Subscription payment request not found."
      );
    }

    if (
      request.status !==
      "payment_submitted"
    ) {
      throw httpError(
        409,
        `This subscription request cannot be approved because its current status is "${request.status}".`
      );
    }

    if (
      !request.payment_proof_file_id
    ) {
      throw httpError(
        409,
        "This subscription request does not have a payment proof."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify the proof still exists
    |--------------------------------------------------------------------------
    */

    const proof =
      await repo.findSubscriptionPaymentProof({
        requestId,
      });

    if (!proof) {
      throw httpError(
        409,
        "The payment proof attached to this request could not be found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate subscription expiry
    |--------------------------------------------------------------------------
    */

    const days =
      Number(durationDays || 30);

    const expiresAt =
      new Date(
        Date.now() +
          days *
            24 *
            60 *
            60 *
            1000
      );

    /*
    |--------------------------------------------------------------------------
    | Find existing user subscription
    |--------------------------------------------------------------------------
    */

    const existingSubscription =
      await repo.findUserSubscription({
        connection,
        tenantId:
          request.tenant_id,
        userId:
          request.user_id,
      });

    let subscriptionId;

    if (existingSubscription) {
      /*
      |--------------------------------------------------------------------------
      | Existing pending/expired/cancelled subscription
      |--------------------------------------------------------------------------
      */

      await repo.activateUserSubscription({
        connection,
        subscriptionId:
          existingSubscription.id,
        planId:
          request.plan_id,
        expiresAt,
      });

      subscriptionId =
        existingSubscription.id;
    } else {
      /*
      |--------------------------------------------------------------------------
      | First subscription for this tenant owner
      |--------------------------------------------------------------------------
      */

      subscriptionId =
        await repo.createUserSubscription({
          connection,
          tenantId:
            request.tenant_id,
          userId:
            request.user_id,
          planId:
            request.plan_id,
          expiresAt,
        });
    }

    /*
|--------------------------------------------------------------------------
| Activate tenant
|--------------------------------------------------------------------------
*/

await repo.activateTenant({
  connection,
  tenantId:
    request.tenant_id,
});

/*
|--------------------------------------------------------------------------
| Activate tenant owner
|--------------------------------------------------------------------------
|
| The tenant owner is intentionally created as "pending" during onboarding.
| Once the subscription payment has been reviewed and approved, the owner
| can be activated so that tenant authentication succeeds.
|
| This is performed inside the same transaction as subscription and tenant
| activation so we cannot end up with a partially activated tenant.
|
*/

    const ownerActivated =
      await repo.activateTenantOwner({
        connection,
        tenantId:
          request.tenant_id,
        userId:
          request.user_id,
      });

    if (!ownerActivated) {
      throw httpError(
        409,
        "The tenant owner account could not be activated."
      );
    }


    /*
    |--------------------------------------------------------------------------
    | Approve payment request
    |--------------------------------------------------------------------------
    */

const approved =
  await repo.approveSubscriptionRequest({
    connection,
    requestId,
    reviewerUserId:
      auth.userId,
  });

if (!approved) {
  throw httpError(
    409,
    "The subscription request could not be approved."
  );
}

await repo.consumeTenantOnboardingSessions({
  connection,
  tenantId:
    request.tenant_id,
  userId:
    request.user_id,
});

await connection.commit();

    return {
      requestId,
      subscriptionId,

      tenantId:
        request.tenant_id,

      userId:
        request.user_id,

      planId:
        request.plan_id,

      status: "approved",

      subscriptionStatus:
        "active",

      tenantStatus:
        "active",

      userStatus:
        "active",

      startsAt:
        new Date(),

      expiresAt,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const rejectRequest = async ({
  auth,
  requestId,
  reason,
}) => {
  const request =
    await repo.findSubscriptionRequestById({
      requestId,
    });

  if (!request) {
    throw httpError(
      404,
      "Subscription payment request not found."
    );
  }

  if (
    request.status !==
    "payment_submitted"
  ) {
    throw httpError(
      409,
      `This subscription request cannot be rejected because its current status is "${request.status}".`
    );
  }

  const rejected =
    await repo.rejectSubscriptionRequest({
      requestId,
      reviewerUserId:
        auth.userId,
      reason,
    });

  if (!rejected) {
    throw httpError(
      409,
      "The subscription request could not be rejected."
    );
  }

  return {
    requestId,

    tenantId:
      request.tenant_id,

    userId:
      request.user_id,

    planId:
      request.plan_id,

    status: "rejected",

    rejectionReason:
      reason,

    tenantStatus:
      request.tenant_status,
  };
};

module.exports = {
  createPlan,
  getPlan,
  updatePlanFeatures,
  changeTenantPlan,
  changeTenantSubscriptionStatus,
  renewTenantSubscription,
  listRequests,
  getRequest,
  getPaymentProof,
  approveRequest,
  rejectRequest,


  listPlans: ({ query }) =>
    repo.listPlans({
      page: Number(query.page || 1),
      limit: Math.min(
        Number(query.limit || 20),
        100
      ),
      search: query.search,
      status: query.status,
    }),

  updatePlan: async ({
    auth,
    planId,
    body,
  }) => {
    const plan = await repo.findPlanById(planId);

    if (!plan) {
      throw httpError(
        404,
        "Subscription plan not found."
      );
    }

    return repo.updatePlan({
      planId,
      body,
      actorUserId: auth.userId,
    });
  },

  getTenantSubscription: async ({
  tenantId,
}) => {
  const subscription =
    await repo.findTenantSubscription(
      tenantId
    );

  if (!subscription) {
    return {
      subscription: null,
      override: null,
      history:
        await repo.listTenantSubscriptionHistory({
          tenantId,
          limit: 100,
        }),
    };
  }

  return {
    subscription,

    override:
      await repo.getTenantOverride({
        tenantId,
        subscriptionId:
          subscription.id,
      }),

    history:
      await repo.listTenantSubscriptionHistory({
        tenantId,
        limit: 100,
      }),
  };
},

  upsertTenantOverride: async ({
    auth,
    tenantId,
    body,
  }) => {
    const subscription =
      await repo.findTenantSubscription(tenantId);

    if (!subscription) {
      throw httpError(
        404,
        "Tenant subscription not found."
      );
    }

    await repo.upsertTenantOverride({
      tenantId,
      subscriptionId: subscription.id,
      body,
      actorUserId: auth.userId,
    });

    return repo.getTenantOverride({
      tenantId,
      subscriptionId: subscription.id,
    });
  },
};
