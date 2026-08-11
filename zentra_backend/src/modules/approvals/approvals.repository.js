const { randomUUID } = require("crypto");
const db = require("../../config/db");

const createPolicy = async ({
  tenantId,
  body,
  createdBy,
}) => {
  const id = randomUUID();

  await db.query(
    `
      INSERT INTO approval_policies (
        id,
        tenant_id,
        code,
        name,
        description,
        action_type,
        minimum_amount,
        maximum_amount,
        currency,
        required_approvals,
        require_distinct_roles,
        prohibit_self_approval,
        allowed_role_ids,
        allowed_permission_codes,
        expires_after_minutes,
        status,
        priority,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      body.code,
      body.name,
      body.description || null,
      body.actionType,
      body.minimumAmount ?? null,
      body.maximumAmount ?? null,
      body.currency || null,
      body.requiredApprovals,
      body.requireDistinctRoles,
      body.prohibitSelfApproval,
      body.allowedRoleIds
        ? JSON.stringify(body.allowedRoleIds)
        : null,
      body.allowedPermissionCodes
        ? JSON.stringify(body.allowedPermissionCodes)
        : null,
      body.expiresAfterMinutes ?? null,
      body.status,
      body.priority,
      createdBy,
    ]
  );

  return findPolicyById({
    tenantId,
    policyId: id,
  });
};

const findPolicyById = async ({
  tenantId,
  policyId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM approval_policies
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
    `,
    [tenantId, policyId]
  );

  return rows[0] || null;
};

const listPolicies = async ({
  tenantId,
  actionType,
  status,
}) => {
  const conditions = ["tenant_id = ?"];
  const values = [tenantId];

  if (actionType) {
    conditions.push("action_type = ?");
    values.push(actionType);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM approval_policies
      WHERE ${conditions.join(" AND ")}
      ORDER BY priority ASC, created_at ASC
    `,
    values
  );

  return rows;
};

const updatePolicy = async ({
  tenantId,
  policyId,
  body,
  updatedBy,
}) => {
  await db.query(
    `
      UPDATE approval_policies
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        minimum_amount = COALESCE(?, minimum_amount),
        maximum_amount = COALESCE(?, maximum_amount),
        currency = COALESCE(?, currency),
        required_approvals = COALESCE(?, required_approvals),
        require_distinct_roles = COALESCE(?, require_distinct_roles),
        prohibit_self_approval = COALESCE(?, prohibit_self_approval),
        allowed_role_ids = COALESCE(?, allowed_role_ids),
        allowed_permission_codes = COALESCE(?, allowed_permission_codes),
        expires_after_minutes = COALESCE(?, expires_after_minutes),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        updated_by = ?
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      body.name ?? null,
      body.description ?? null,
      body.minimumAmount ?? null,
      body.maximumAmount ?? null,
      body.currency ?? null,
      body.requiredApprovals ?? null,
      body.requireDistinctRoles ?? null,
      body.prohibitSelfApproval ?? null,
      body.allowedRoleIds
        ? JSON.stringify(body.allowedRoleIds)
        : null,
      body.allowedPermissionCodes
        ? JSON.stringify(body.allowedPermissionCodes)
        : null,
      body.expiresAfterMinutes ?? null,
      body.status ?? null,
      body.priority ?? null,
      updatedBy,
      tenantId,
      policyId,
    ]
  );

  return findPolicyById({
    tenantId,
    policyId,
  });
};

const findMatchingPolicy = async ({
  tenantId,
  actionType,
  amount,
  currency,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM approval_policies
      WHERE tenant_id = ?
        AND action_type = ?
        AND status = 'active'
        AND (
          currency IS NULL
          OR currency = ?
        )
        AND (
          minimum_amount IS NULL
          OR minimum_amount <= ?
        )
        AND (
          maximum_amount IS NULL
          OR maximum_amount >= ?
        )
      ORDER BY priority ASC, created_at ASC
      LIMIT 1
    `,
    [
      tenantId,
      actionType,
      currency || null,
      amount ?? 0,
      amount ?? 0,
    ]
  );

  return rows[0] || null;
};

const findRequestByIdempotency = async ({
  tenantId,
  idempotencyKey,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM approval_requests
      WHERE tenant_id = ?
        AND idempotency_key = ?
      LIMIT 1
    `,
    [tenantId, idempotencyKey]
  );

  return rows[0] || null;
};

const findRequestById = async ({
  connection = db,
  tenantId,
  requestId,
  forUpdate = false,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM approval_requests
      WHERE tenant_id = ?
        AND id = ?
      LIMIT 1
      ${forUpdate ? "FOR UPDATE" : ""}
    `,
    [tenantId, requestId]
  );

  return rows[0] || null;
};

const createRequest = async ({
  tenantId,
  policy,
  body,
  requestedBy,
}) => {
  const id = randomUUID();

  const expiresAt =
    policy.expires_after_minutes
      ? new Date(
          Date.now() +
          Number(policy.expires_after_minutes) *
            60 *
            1000
        )
      : null;

  await db.query(
    `
      INSERT INTO approval_requests (
        id,
        tenant_id,
        policy_id,
        action_type,
        source_type,
        source_id,
        request_reference,
        idempotency_key,
        amount,
        currency,
        requested_by,
        required_approvals,
        expires_at,
        payload,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      tenantId,
      policy.id,
      body.actionType,
      body.sourceType,
      body.sourceId,
      body.requestReference,
      body.idempotencyKey,
      body.amount ?? null,
      body.currency || null,
      requestedBy,
      policy.required_approvals,
      expiresAt,
      body.payload
        ? JSON.stringify(body.payload)
        : null,
      body.metadata
        ? JSON.stringify(body.metadata)
        : null,
    ]
  );

  return findRequestById({
    tenantId,
    requestId: id,
  });
};

const findDecisionByActor = async ({
  connection = db,
  requestId,
  decidedBy,
}) => {
  const [rows] = await connection.query(
    `
      SELECT *
      FROM approval_decisions
      WHERE approval_request_id = ?
        AND decided_by = ?
      LIMIT 1
    `,
    [requestId, decidedBy]
  );

  return rows[0] || null;
};

const listApprovedRoles = async ({
  connection = db,
  requestId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT DISTINCT role_id
      FROM approval_decisions
      WHERE approval_request_id = ?
        AND decision = 'approved'
        AND role_id IS NOT NULL
    `,
    [requestId]
  );

  return rows.map(
    (row) => row.role_id
  );
};

const createDecision = ({
  connection = db,
  tenantId,
  requestId,
  decidedBy,
  decision,
  roleId,
  comment,
  metadata,
}) =>
  connection.query(
    `
      INSERT INTO approval_decisions (
        id,
        tenant_id,
        approval_request_id,
        decided_by,
        decision,
        role_id,
        comment,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      requestId,
      decidedBy,
      decision,
      roleId || null,
      comment || null,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

const updateRequestCountsAndStatus = async ({
  connection = db,
  tenantId,
  requestId,
}) => {
  const [rows] = await connection.query(
    `
      SELECT
        SUM(
          CASE
            WHEN decision = 'approved'
            THEN 1
            ELSE 0
          END
        ) AS approvals,
        SUM(
          CASE
            WHEN decision = 'rejected'
            THEN 1
            ELSE 0
          END
        ) AS rejections
      FROM approval_decisions
      WHERE approval_request_id = ?
    `,
    [requestId]
  );

  const approvals =
    Number(rows[0].approvals || 0);

  const rejections =
    Number(rows[0].rejections || 0);

  const request =
    await findRequestById({
      connection,
      tenantId,
      requestId,
      forUpdate: true,
    });

  let status = "pending";

  if (rejections > 0) {
    status = "rejected";
  } else if (
    approvals >=
    Number(request.required_approvals)
  ) {
    status = "approved";
  }

  await connection.query(
    `
      UPDATE approval_requests
      SET
        approval_count = ?,
        rejection_count = ?,
        status = ?,
        approved_at = CASE
          WHEN ? = 'approved'
          THEN NOW()
          ELSE approved_at
        END,
        rejected_at = CASE
          WHEN ? = 'rejected'
          THEN NOW()
          ELSE rejected_at
        END
      WHERE tenant_id = ?
        AND id = ?
    `,
    [
      approvals,
      rejections,
      status,
      status,
      status,
      tenantId,
      requestId,
    ]
  );

  return findRequestById({
    connection,
    tenantId,
    requestId,
  });
};

const addEvent = ({
  connection = db,
  tenantId,
  requestId,
  eventType,
  actorUserId,
  note,
  metadata,
}) =>
  connection.query(
    `
      INSERT INTO approval_request_events (
        id,
        tenant_id,
        approval_request_id,
        event_type,
        actor_user_id,
        note,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      randomUUID(),
      tenantId,
      requestId,
      eventType,
      actorUserId || null,
      note || null,
      metadata
        ? JSON.stringify(metadata)
        : null,
    ]
  );

const listRequests = async ({
  tenantId,
  status,
  actionType,
  requestedBy,
  limit,
  offset,
}) => {
  const conditions = ["tenant_id = ?"];
  const values = [tenantId];

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (actionType) {
    conditions.push("action_type = ?");
    values.push(actionType);
  }

  if (requestedBy) {
    conditions.push("requested_by = ?");
    values.push(requestedBy);
  }

  const [rows] = await db.query(
    `
      SELECT *
      FROM approval_requests
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return rows;
};

const listDecisions = async ({
  tenantId,
  requestId,
}) => {
  const [rows] = await db.query(
    `
      SELECT *
      FROM approval_decisions
      WHERE tenant_id = ?
        AND approval_request_id = ?
      ORDER BY created_at ASC
    `,
    [tenantId, requestId]
  );

  return rows;
};

const expireRequests = async ({
  tenantId,
}) => {
  const [result] = await db.query(
    `
      UPDATE approval_requests
      SET status = 'expired'
      WHERE tenant_id = ?
        AND status = 'pending'
        AND expires_at IS NOT NULL
        AND expires_at <= NOW()
    `,
    [tenantId]
  );

  return result.affectedRows;
};

const cancelRequest = async ({
  tenantId,
  requestId,
  requestedBy,
}) => {
  await db.query(
    `
      UPDATE approval_requests
      SET
        status = 'cancelled',
        cancelled_at = NOW()
      WHERE tenant_id = ?
        AND id = ?
        AND requested_by = ?
        AND status = 'pending'
    `,
    [
      tenantId,
      requestId,
      requestedBy,
    ]
  );

  return findRequestById({
    tenantId,
    requestId,
  });
};

module.exports = {
  db,
  createPolicy,
  findPolicyById,
  listPolicies,
  updatePolicy,
  findMatchingPolicy,
  findRequestByIdempotency,
  findRequestById,
  createRequest,
  findDecisionByActor,
  listApprovedRoles,
  createDecision,
  updateRequestCountsAndStatus,
  addEvent,
  listRequests,
  listDecisions,
  expireRequests,
  cancelRequest,
};
