const repo =
  require("./approvals.repository");

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

const parseJson = (
  value
) => {
  if (!value) {
    return [];
  }

  if (
    typeof value === "object"
  ) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const createPolicy = ({
  auth,
  body,
}) =>
  repo.createPolicy({
    tenantId:
      auth.tenantId,

    body,

    createdBy:
      auth.userId,
  });

const listPolicies = ({
  auth,
  query,
}) =>
  repo.listPolicies({
    tenantId:
      auth.tenantId,

    actionType:
      query.actionType || null,

    status:
      query.status || null,
  });

const updatePolicy = async ({
  auth,
  policyId,
  body,
}) => {
  const existing =
    await repo.findPolicyById({
      tenantId:
        auth.tenantId,

      policyId,
    });

  if (!existing) {
    throw httpError(
      404,
      "Approval policy not found"
    );
  }

  return repo.updatePolicy({
    tenantId:
      auth.tenantId,

    policyId,

    body,

    updatedBy:
      auth.userId,
  });
};

const createRequest = async ({
  auth,
  body,
}) => {
  const existing =
    await repo.findRequestByIdempotency({
      tenantId:
        auth.tenantId,

      idempotencyKey:
        body.idempotencyKey,
    });

  if (existing) {
    return {
      idempotent:
        true,

      request:
        existing,
    };
  }

  const policy =
    await repo.findMatchingPolicy({
      tenantId:
        auth.tenantId,

      actionType:
        body.actionType,

      amount:
        body.amount ?? 0,

      currency:
        body.currency || null,
    });

  if (!policy) {
    return {
      approvalRequired:
        false,

      reason:
        "No active approval policy matched this action",
    };
  }

  const request =
    await repo.createRequest({
      tenantId:
        auth.tenantId,

      policy,

      body,

      requestedBy:
        auth.userId,
    });

  await repo.addEvent({
    tenantId:
      auth.tenantId,

    requestId:
      request.id,

    eventType:
      "approval_requested",

    actorUserId:
      auth.userId,

    metadata: {
      policyId:
        policy.id,

      requiredApprovals:
        policy.required_approvals,
    },
  });

  return {
    idempotent:
      false,

    approvalRequired:
      true,

    request,
  };
};

const validateApprover = async ({
  auth,
  request,
  policy,
  body,
}) => {
  if (
    request.status !==
    "pending"
  ) {
    throw httpError(
      409,
      "This approval request is no longer pending"
    );
  }

  if (
    request.expires_at &&
    new Date(
      request.expires_at
    ) <= new Date()
  ) {
    throw httpError(
      409,
      "This approval request has expired"
    );
  }

  if (
    policy.prohibit_self_approval &&
    request.requested_by ===
      auth.userId
  ) {
    throw httpError(
      403,
      "The request maker cannot approve this action"
    );
  }

  const allowedRoleIds =
    parseJson(
      policy.allowed_role_ids
    );

  if (
    allowedRoleIds.length &&
    !allowedRoleIds.includes(
      body.roleId
    )
  ) {
    throw httpError(
      403,
      "Your role is not allowed to approve this action"
    );
  }

  const allowedPermissions =
    parseJson(
      policy.allowed_permission_codes
    );

  if (
    allowedPermissions.length
  ) {
    const userPermissions =
      auth.permissions || [];

    const permitted =
      allowedPermissions.some(
        (permission) =>
          userPermissions.includes(
            permission
          )
      );

    if (!permitted) {
      throw httpError(
        403,
        "You do not have an allowed approval permission"
      );
    }
  }

  const existingDecision =
    await repo.findDecisionByActor({
      requestId:
        request.id,

      decidedBy:
        auth.userId,
    });

  if (existingDecision) {
    throw httpError(
      409,
      "You have already decided on this request"
    );
  }

  if (
    policy.require_distinct_roles &&
    body.decision ===
      "approved"
  ) {
    const approvedRoles =
      await repo.listApprovedRoles({
        requestId:
          request.id,
      });

    if (
      body.roleId &&
      approvedRoles.includes(
        body.roleId
      )
    ) {
      throw httpError(
        409,
        "A different role must provide the next approval"
      );
    }
  }
};

const decide = async ({
  auth,
  requestId,
  body,
}) => {
  const connection =
    await repo.db.getConnection();

  try {
    await connection.beginTransaction();

    const request =
      await repo.findRequestById({
        connection,

        tenantId:
          auth.tenantId,

        requestId,

        forUpdate:
          true,
      });

    if (!request) {
      throw httpError(
        404,
        "Approval request not found"
      );
    }

    const policy =
      await repo.findPolicyById({
        tenantId:
          auth.tenantId,

        policyId:
          request.policy_id,
      });

    if (!policy) {
      throw httpError(
        409,
        "Approval policy is unavailable"
      );
    }

    await validateApprover({
      auth,
      request,
      policy,
      body,
    });

    await repo.createDecision({
      connection,

      tenantId:
        auth.tenantId,

      requestId,

      decidedBy:
        auth.userId,

      decision:
        body.decision,

      roleId:
        body.roleId || null,

      comment:
        body.comment,

      metadata:
        body.metadata,
    });

    const updated =
      await repo.updateRequestCountsAndStatus({
        connection,

        tenantId:
          auth.tenantId,

        requestId,
      });

    await repo.addEvent({
      connection,

      tenantId:
        auth.tenantId,

      requestId,

      eventType:
        body.decision ===
          "approved"
          ? "approval_granted"
          : "approval_rejected",

      actorUserId:
        auth.userId,

      note:
        body.comment,

      metadata: {
        roleId:
          body.roleId || null,

        resultingStatus:
          updated.status,
      },
    });

    await connection.commit();

    return {
      request:
        updated,

      executionReady:
        updated.status ===
          "approved",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getRequest = async ({
  auth,
  requestId,
}) => {
  const request =
    await repo.findRequestById({
      tenantId:
        auth.tenantId,

      requestId,
    });

  if (!request) {
    throw httpError(
      404,
      "Approval request not found"
    );
  }

  const decisions =
    await repo.listDecisions({
      tenantId:
        auth.tenantId,

      requestId,
    });

  return {
    request,
    decisions,
  };
};

const listRequests = ({
  auth,
  query,
  mine = false,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listRequests({
    tenantId:
      auth.tenantId,

    status:
      query.status || null,

    actionType:
      query.actionType || null,

    requestedBy:
      mine
        ? auth.userId
        : null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

const cancelRequest = async ({
  auth,
  requestId,
}) => {
  const request =
    await repo.findRequestById({
      tenantId:
        auth.tenantId,

      requestId,
    });

  if (!request) {
    throw httpError(
      404,
      "Approval request not found"
    );
  }

  if (
    request.requested_by !==
    auth.userId
  ) {
    throw httpError(
      403,
      "Only the request maker can cancel this approval"
    );
  }

  if (
    request.status !==
    "pending"
  ) {
    throw httpError(
      409,
      "Only pending requests can be cancelled"
    );
  }

  const updated =
    await repo.cancelRequest({
      tenantId:
        auth.tenantId,

      requestId,

      requestedBy:
        auth.userId,
    });

  await repo.addEvent({
    tenantId:
      auth.tenantId,

    requestId,

    eventType:
      "approval_cancelled",

    actorUserId:
      auth.userId,
  });

  return updated;
};

const expireRequests = ({
  auth,
}) =>
  repo.expireRequests({
    tenantId:
      auth.tenantId,
  });

module.exports = {
  createPolicy,
  listPolicies,
  updatePolicy,
  createRequest,
  decide,
  getRequest,
  listRequests,
  cancelRequest,
  expireRequests,
};
