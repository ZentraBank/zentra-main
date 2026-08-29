const bcrypt = require("bcryptjs");
const env = require("../../config/env");
const db = require("../../config/db");
const repo = require("./superadmin.repository");
const domainProvisioningService =
  require("../tenants/domain-provisioning.service");

const httpError = (
  statusCode,
  message
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createTenant = async ({
  auth,
  body,
  requestContext,
}) => {
  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    /*
     * 1. Create tenant
     */
    const tenantId =
      await repo.createTenant({
        connection,
        body,
        createdBy: auth.userId,
      });

    /*
     * 2. Create the tenant's system roles
     * and attach the appropriate permissions.
     */
    await repo.createTenantSystemRoles({
      connection,
      tenantId,
    });

    await repo.createTenantSubscriptionPlans({
  connection,
  tenantId,
});

const slug = body.code
  .trim()
  .toLowerCase()
  .replace(/_/g, "-");

const temporaryDomain =
  await repo.createTemporaryTenantDomain({
    connection,
    tenantId,
    slug,
    rootDomain:
      env.tenantTemporaryDomain,
  });

const selectedPlan =
  await repo.findTenantPlanByCode({
    connection,
    tenantId,
    planCode: body.planCode,
  });

if (!selectedPlan) {
  throw httpError(
    500,
    `Subscription plan "${body.planCode}" was not created for the tenant.`
  );
}

    /*
     * 3. Hash the tenant owner's password.
     *
     * Password hashing belongs in the
     * service layer, not the repository.
     */
    const ownerPasswordHash =
      await bcrypt.hash(
        body.ownerPassword,
        12
      );

    /*
     * 4. Create owner + tenant membership.
     */
    const owner =
      await repo.createTenantOwner({
        connection,
        tenantId,
        body: {
          ...body,
          ownerPasswordHash,
        },
      });

    /*
     * 5. Create the subscription only
     * when a plan was supplied.
     */
    let subscriptionId = null;

    subscriptionId =
  await repo.createSubscription({
    connection,
    tenantId,
    userId: owner.userId,
    planId: selectedPlan.id,
  });

    /*
     * 6. Platform audit log.
     */
    await repo.createAuditLog({
      actorUserId: auth.userId,
      actionCode:
        "platform.tenant.created",
      tenantId,
      entityType: "tenant",
      entityId: tenantId,
      newValues: {
  code: body.code,
  name: body.name,

  temporaryDomain:
    temporaryDomain.domain,

  ownerUserId:
    owner.userId,

  membershipId:
    owner.membershipId,

  planCode:
    selectedPlan.code,

  planId:
    selectedPlan.id,

  subscriptionId,
},
      requestContext,
      connection,
    });

    await connection.commit();

   return {
  tenantId,

  temporaryDomain:
    temporaryDomain.domain,

  ownerUserId:
    owner.userId,

  membershipId:
    owner.membershipId,

  subscriptionId,

  status: "pending",
};
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateTenantStatus = async ({
  auth,
  tenantId,
  status,
  requestContext,
}) => {
  const connection =
    await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] =
      await connection.query(
        `
          SELECT *
          FROM tenants
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [tenantId]
      );

    const tenant = rows[0];

    if (!tenant) {
      throw httpError(
        404,
        "Tenant not found."
      );
    }

    const transitions = {
      pending: [
        "active",
        "suspended",
        "terminated",
      ],

      active: [
        "suspended",
        "terminated",
      ],

      suspended: [
        "active",
        "terminated",
      ],

      terminated: [],
    };

    const allowedTransitions =
      transitions[tenant.status] || [];

    if (
      !allowedTransitions.includes(
        status
      )
    ) {
      throw httpError(
        409,
        `Cannot change tenant from ${tenant.status} to ${status}.`
      );
    }

    await connection.query(
      `
        UPDATE tenants
        SET status = ?
        WHERE id = ?
      `,
      [status, tenantId]
    );

    if (status === "active") {
      await connection.query(
        `
          UPDATE users u

          INNER JOIN tenant_memberships tm
            ON tm.user_id = u.id

          INNER JOIN roles r
            ON r.id = tm.role_id

          SET u.status = 'active'

          WHERE tm.tenant_id = ?
            AND r.code = 'tenant_admin'
            AND u.deleted_at IS NULL
        `,
        [tenantId]
      );
    }

    if (
      status === "suspended" ||
      status === "terminated"
    ) {
      await connection.query(
        `
          UPDATE users u

          INNER JOIN tenant_memberships tm
            ON tm.user_id = u.id

          INNER JOIN roles r
            ON r.id = tm.role_id

          SET u.status = 'suspended'

          WHERE tm.tenant_id = ?
            AND r.code = 'tenant_admin'
            AND u.deleted_at IS NULL
        `,
        [tenantId]
      );
    }

    await repo.createAuditLog({
      actorUserId:
        auth.userId,

      actionCode:
        `platform.tenant.${status}`,

      tenantId,

      entityType:
        "tenant",

      entityId:
        tenantId,

      oldValues: {
        status:
          tenant.status,
      },

      newValues: {
        status,
      },

      requestContext,
      connection,
    });

    await connection.commit();

    return {
      ...tenant,
      status,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateTenantFeatures = async ({
  auth,
  tenantId,
  features,
  reason,
  requestContext,
}) => {
  const tenant =
    await repo.findTenantById(
      tenantId
    );

  if (!tenant) {
    throw httpError(
      404,
      "Tenant not found."
    );
  }

  for (
    const [
      featureCode,
      isEnabled,
    ] of Object.entries(features)
  ) {
    await repo.upsertFeatureOverride({
      tenantId,
      featureCode,
      isEnabled,
      reason,
      actorUserId:
        auth.userId,
    });
  }

  await repo.createAuditLog({
    actorUserId:
      auth.userId,

    actionCode:
      "platform.tenant.features_updated",

    tenantId,

    entityType:
      "tenant",

    entityId:
      tenantId,

    newValues: {
      features,
      reason:
        reason || null,
    },

    requestContext,
  });

  return repo.listFeatureOverrides(
    tenantId
  );
};

const getDashboard = () =>
  repo.getDashboardMetrics();

const listTenants = ({
  query,
}) =>
  repo.listTenants({
    page:
      Number(query.page || 1),

    limit:
      Math.min(
        Number(query.limit || 20),
        100
      ),

    search:
      query.search,

    status:
      query.status,
  });

const getTenant = async ({
  tenantId,
}) => {
  const tenant =
    await repo.findTenantById(
      tenantId
    );

  if (!tenant) {
    throw httpError(
      404,
      "Tenant not found."
    );
  }

  const [
    featureOverrides,
    administrators,
  ] = await Promise.all([
    repo.listFeatureOverrides(
      tenantId
    ),

    repo.listTenantAdministrators(
      tenantId
    ),
  ]);

  return {
    tenant,
    featureOverrides,
    administrators,
  };
};

const listTenantAdministrators = ({
  tenantId,
}) =>
  repo.listTenantAdministrators(
    tenantId
  );

const listAuditLogs = ({
  query,
}) =>
  repo.listAuditLogs({
    limit:
      Math.min(
        Number(query.limit || 50),
        200
      ),
  });
const listTenantDomains = ({
  query,
}) =>
  repo.listTenantDomains({
    page:
      Number(query.page || 1),

    limit:
      Math.min(
        Number(query.limit || 20),
        100
      ),

    search:
      query.search,

    status:
      query.status,

    domainType:
      query.domainType,

    tenantId:
      query.tenantId,
  });

const getTenantDomain =
  async ({
    domainId,
  }) => {
    const domain =
      await repo.findTenantDomainById(
        domainId
      );

    if (!domain) {
      throw httpError(
        404,
        "Tenant domain not found."
      );
    }

    return {
      id:
        domain.id,

      tenantId:
        domain.tenant_id,

      domain:
        domain.domain,

      type:
        domain.domain_type,

      status:
        domain.status,

      isPrimary:
        Boolean(
          domain.is_primary
        ),

      verificationMethod:
        domain.verification_method,

      targetHost:
        domain.target_host,

      sslStatus:
        domain.ssl_status,

      provider:
        domain.provider,

      providerHostnameId:
        domain.provider_hostname_id,

      verificationAttempts:
        Number(
          domain.verification_attempts ||
            0
        ),

      lastVerificationAt:
        domain.last_verification_at,

      verifiedAt:
        domain.verified_at,

      activatedAt:
        domain.activated_at,

      failureReason:
        domain.failure_reason,

      createdAt:
        domain.created_at,

      updatedAt:
        domain.updated_at,

      tenant: {
        name:
          domain.tenant_name,

        slug:
          domain.tenant_slug,

        appName:
          domain.tenant_app_name,

        status:
          domain.tenant_status,
      },
    };
  };

  const refreshTenantDomain =
  async ({
    domainId,
    actor,
  }) => {
    const domain =
      await repo.findTenantDomainById(
        domainId
      );

    if (!domain) {
      throw httpError(
        404,
        "Tenant domain not found."
      );
    }

    if (
      !domain.provider_hostname_id
    ) {
      throw httpError(
        400,
        "This domain has not been provisioned with a provider yet."
      );
    }

    try {
      const providerStatus =
        await domainProvisioningService.getDomainStatus(
          {
            domain:
              domain.domain,

            provider:
              domain.provider,

            providerHostnameId:
              domain.provider_hostname_id,
          }
        );

      await repo.updateTenantDomainProviderDetails(
        {
          domainId,

          provider:
            providerStatus.provider ??
            domain.provider,

          providerHostnameId:
            providerStatus.providerHostnameId ??
            domain.provider_hostname_id,

          sslStatus:
            providerStatus.sslStatus,

          targetHost:
            providerStatus.targetHost ??
            domain.target_host,
        }
      );

      if (
        providerStatus.status ===
          "active" &&
        providerStatus.sslStatus ===
          "active"
      ) {
        await repo.markTenantDomainActive(
          {
            domainId,
            sslStatus:
              providerStatus.sslStatus,
          }
        );
      } else if (
        providerStatus.status ===
        "failed"
      ) {
        await repo.markTenantDomainFailed(
          {
            domainId,

            failureReason:
              providerStatus.failureReason ||
              "Domain provider reported a provisioning failure.",
          }
        );
      } else {
        await repo.updateTenantDomainStatus(
          {
            domainId,

            status:
              providerStatus.status ||
              "provisioning",

            failureReason:
              null,
          }
        );
      }

      const refreshed =
        await repo.findTenantDomainById(
          domainId
        );

      return {
        domain: refreshed,

        providerStatus,
      };
    } catch (error) {
      await repo.markTenantDomainFailed(
        {
          domainId,

          failureReason:
            error.message ||
            "Unable to refresh domain provider status.",
        }
      );

      throw error;
    }
  };

  const retryTenantDomainProvisioning =
  async ({
    domainId,
    actor,
  }) => {
    const domain =
      await repo.findTenantDomainById(
        domainId
      );

    if (!domain) {
      throw httpError(
        404,
        "Tenant domain not found."
      );
    }

    if (
      domain.domain_type !==
      "custom"
    ) {
      throw httpError(
        400,
        "Only custom domains can be reprovisioned."
      );
    }

    if (
      ![
        "verified",
        "provisioning",
        "failed",
      ].includes(
        domain.status
      )
    ) {
      throw httpError(
        400,
        `Domain cannot be provisioned while its status is ${domain.status}.`
      );
    }

    await repo.markTenantDomainProvisioning(
      domainId
    );

    try {
      /*
       * If an old provider hostname still exists,
       * clean it up first.
       */
      if (
        domain.provider_hostname_id
      ) {
        try {
          await domainProvisioningService.deleteDomain(
            {
              domain:
                domain.domain,

              provider:
                domain.provider,

              providerHostnameId:
                domain.provider_hostname_id,
            }
          );
        } catch (cleanupError) {
          /*
           * Do not block retry just because
           * cleanup failed. The provider may
           * already have deleted the hostname.
           */
          console.warn(
            "Unable to clean previous domain provider record:",
            cleanupError.message
          );
        }
      }

      const result =
        await domainProvisioningService.provisionDomain(
          {
            domain:
              domain.domain,

            tenantId:
              domain.tenant_id,

            targetHost:
              domain.target_host,
          }
        );

      await repo.updateTenantDomainProviderDetails(
        {
          domainId,

          provider:
            result.provider,

          providerHostnameId:
            result.providerHostnameId,

          sslStatus:
            result.sslStatus,

          targetHost:
            result.targetHost ??
            domain.target_host,
        }
      );

      if (
        result.status ===
          "active" &&
        result.sslStatus ===
          "active"
      ) {
        await repo.markTenantDomainActive(
          {
            domainId,

            sslStatus:
              result.sslStatus,
          }
        );
      } else {
        await repo.updateTenantDomainStatus(
          {
            domainId,

            status:
              result.status ||
              "provisioning",

            failureReason:
              null,
          }
        );
      }

      return repo.findTenantDomainById(
        domainId
      );
    } catch (error) {
      await repo.markTenantDomainFailed(
        {
          domainId,

          failureReason:
            error.message ||
            "Domain provisioning failed.",
        }
      );

      throw error;
    }
  };


  const disconnectTenantDomain =
  async ({
    domainId,
    actor,
  }) => {
    const domain =
      await repo.findTenantDomainById(
        domainId
      );

    if (!domain) {
      throw httpError(
        404,
        "Tenant domain not found."
      );
    }

    if (
      domain.domain_type ===
      "temporary"
    ) {
      throw httpError(
        400,
        "The tenant temporary domain cannot be disconnected."
      );
    }

    if (
      domain.status ===
      "disconnected"
    ) {
      return domain;
    }

    if (
      domain.provider_hostname_id
    ) {
      await domainProvisioningService.deleteDomain(
        {
          domain:
            domain.domain,

          provider:
            domain.provider,

          providerHostnameId:
            domain.provider_hostname_id,
        }
      );
    }

    await repo.disconnectTenantDomain(
      domainId
    );

    await repo.makeTemporaryDomainPrimary(
      domain.tenant_id
    );

    return repo.findTenantDomainById(
      domainId
    );
  };


module.exports = {
  createTenant,
  updateTenantStatus,
  updateTenantFeatures,

  getDashboard,
  listTenants,
  getTenant,

  listTenantAdministrators,
  listAuditLogs,

  listTenantDomains,
  getTenantDomain,
  listTenantDomains,
  getTenantDomain,

  refreshTenantDomain,
  retryTenantDomainProvisioning,
  disconnectTenantDomain,
  
};