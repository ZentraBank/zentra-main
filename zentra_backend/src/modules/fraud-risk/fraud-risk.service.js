const repo =
  require("./fraud-risk.repository");

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

const decisionRank = {
  allow: 1,
  allow_with_otp: 2,
  require_step_up: 3,
  require_admin_approval: 4,
  block: 5,
};

const getRiskLevel = (
  score
) => {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 30) {
    return "medium";
  }

  return "low";
};

const getDefaultDecision = (
  score
) => {
  if (score >= 80) {
    return "block";
  }

  if (score >= 60) {
    return "require_admin_approval";
  }

  if (score >= 30) {
    return "require_step_up";
  }

  return "allow";
};

const parseConfig = (
  value
) => {
  if (!value) {
    return {};
  }

  if (
    typeof value === "object"
  ) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const evaluateRule = async ({
  tenantId,
  userId,
  rule,
  body,
  existingDevice,
}) => {
  const config =
    parseConfig(
      rule.configuration
    );

  switch (
    rule.condition_type
  ) {
    case "amount_threshold":
      return (
        Number(body.amount || 0) >=
        Number(config.minimumAmount || 0)
      );

    case "new_device":
      return Boolean(
        body.deviceFingerprint &&
        !existingDevice
      );

    case "ip_change":
      return Boolean(
        existingDevice &&
        body.ipAddress &&
        existingDevice.last_ip_address &&
        existingDevice.last_ip_address !==
          body.ipAddress
      );

    case "country_change":
      return Boolean(
        existingDevice &&
        body.countryCode &&
        existingDevice.last_country &&
        existingDevice.last_country !==
          body.countryCode
      );

    case "velocity": {
      if (!userId) {
        return false;
      }

      const count =
        await repo.countRecentEvents({
          tenantId,
          userId,
          eventType:
            body.eventType,
          minutes:
            Number(
              config.minutes || 5
            ),
        });

      return (
        count >=
        Number(
          config.maximumCount || 5
        )
      );
    }

    case "failed_attempts":
      return (
        Number(
          body.payload?.failedAttempts || 0
        ) >=
        Number(
          config.maximumAttempts || 3
        )
      );

    case "dormant_account":
      return Boolean(
        body.payload?.accountDormant ===
          true
      );

    case "manual":
      return Boolean(
        body.payload?.manualTrigger ===
          true
      );

    default:
      return false;
  }
};

const evaluate = async ({
  auth,
  body,
}) => {
  const existing =
    await repo.findEvaluationByIdempotency({
      tenantId:
        auth.tenantId,

      idempotencyKey:
        body.idempotencyKey,
    });

  if (existing) {
    return {
      idempotent: true,
      evaluation: existing,
    };
  }

  const userId =
    body.userId ||
    auth.userId ||
    null;

  let existingDevice = null;

  if (
    userId &&
    body.deviceFingerprint
  ) {
    existingDevice =
      await repo.findDevice({
        tenantId:
          auth.tenantId,

        userId,

        fingerprintHash:
          body.deviceFingerprint,
      });
  }

  const rules =
    await repo.findActiveRules({
      tenantId:
        auth.tenantId,

      eventType:
        body.eventType,
    });

  const matchedRules = [];
  let totalScore = 0;
  let strongestDecision =
    "allow";

  for (const rule of rules) {
    const matched =
      await evaluateRule({
        tenantId:
          auth.tenantId,

        userId,

        rule,

        body,

        existingDevice,
      });

    if (!matched) {
      continue;
    }

    totalScore +=
      Number(rule.score);

    matchedRules.push({
      ruleId: rule.id,
      code: rule.code,
      name: rule.name,
      score: Number(rule.score),
      decision:
        rule.decision || null,
    });

    if (
      rule.decision &&
      decisionRank[
        rule.decision
      ] >
      decisionRank[
        strongestDecision
      ]
    ) {
      strongestDecision =
        rule.decision;
    }
  }

  const scoreDecision =
    getDefaultDecision(
      totalScore
    );

  if (
    decisionRank[
      scoreDecision
    ] >
    decisionRank[
      strongestDecision
    ]
  ) {
    strongestDecision =
      scoreDecision;
  }

  const riskLevel =
    getRiskLevel(
      totalScore
    );

  const connection =
    await repo.db.getConnection();

  let evaluationId;

  try {
    await connection.beginTransaction();

    const riskEventId =
      await repo.createRiskEvent({
        connection,

        tenantId:
          auth.tenantId,

        userId,

        body,
      });

    evaluationId =
      await repo.createEvaluation({
        connection,

        tenantId:
          auth.tenantId,

        userId,

        riskEventId,

        idempotencyKey:
          body.idempotencyKey,

        totalScore,

        riskLevel,

        decision:
          strongestDecision,

        matchedRules,

        explanation: {
          scoreBands: {
            low: "0-29",
            medium: "30-59",
            high: "60-79",
            critical: "80+",
          },
          matchedRuleCount:
            matchedRules.length,
        },
      });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  if (
    userId &&
    body.deviceFingerprint
  ) {
    await repo.upsertDevice({
      tenantId:
        auth.tenantId,

      userId,

      body,
    });
  }

  let fraudCase = null;

  if (
    ["high", "critical"]
      .includes(riskLevel) ||
    strongestDecision === "block"
  ) {
    fraudCase =
      await repo.createFraudCase({
        tenantId:
          auth.tenantId,

        userId,

        evaluationId,

        severity:
          riskLevel,

        title:
          `${body.eventType} risk alert`,

        description:
          `Risk evaluation produced ${totalScore} points and decision ${strongestDecision}.`,
      });
  }

  return {
    idempotent: false,

    evaluation:
      await repo.findEvaluationById({
        tenantId:
          auth.tenantId,

        evaluationId,
      }),

    fraudCase,
  };
};

const createRule = ({
  auth,
  body,
}) =>
  repo.createRule({
    tenantId:
      auth.tenantId,

    body,

    createdBy:
      auth.userId,
  });

const listRules = ({
  auth,
  query,
}) =>
  repo.listRules({
    tenantId:
      auth.tenantId,

    eventType:
      query.eventType || null,

    status:
      query.status || null,
  });

const updateRule = async ({
  auth,
  ruleId,
  body,
}) => {
  const existing =
    await repo.findRuleById({
      tenantId:
        auth.tenantId,

      ruleId,
    });

  if (!existing) {
    throw httpError(
      404,
      "Risk rule not found"
    );
  }

  return repo.updateRule({
    tenantId:
      auth.tenantId,

    ruleId,

    body,

    updatedBy:
      auth.userId,
  });
};

const listFraudCases = ({
  auth,
  query,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listFraudCases({
    tenantId:
      auth.tenantId,

    status:
      query.status || null,

    severity:
      query.severity || null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

const getFraudCase = async ({
  auth,
  caseId,
}) => {
  const item =
    await repo.findFraudCaseById({
      tenantId:
        auth.tenantId,

      caseId,
    });

  if (!item) {
    throw httpError(
      404,
      "Fraud case not found"
    );
  }

  return item;
};

const updateFraudCase = async ({
  auth,
  caseId,
  body,
}) => {
  await getFraudCase({
    auth,
    caseId,
  });

  if (
    ["resolved", "dismissed"]
      .includes(body.status) &&
    !body.resolutionNote
  ) {
    throw httpError(
      422,
      "A resolution note is required"
    );
  }

  return repo.updateFraudCase({
    tenantId:
      auth.tenantId,

    caseId,

    body,

    actorUserId:
      auth.userId,
  });
};

module.exports = {
  evaluate,
  createRule,
  listRules,
  updateRule,
  listFraudCases,
  getFraudCase,
  updateFraudCase,
};
