const repo =
  require("./compliance.repository");

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

const normaliseName = (
  value
) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9\s]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

const similarity = (
  left,
  right
) => {
  const a =
    new Set(
      normaliseName(left)
        .split(" ")
    );

  const b =
    new Set(
      normaliseName(right)
        .split(" ")
    );

  const intersection =
    [...a].filter(
      (item) =>
        b.has(item)
    ).length;

  const union =
    new Set([
      ...a,
      ...b,
    ]).size;

  if (!union) {
    return 0;
  }

  return Number(
    (
      intersection /
      union *
      100
    ).toFixed(4)
  );
};

const screen = async ({
  auth,
  body,
}) => {
  const existing =
    await repo
      .findScreeningByIdempotency({
        tenantId:
          auth.tenantId,

        idempotencyKey:
          body.idempotencyKey,
      });

  if (existing) {
    return {
      idempotent: true,
      screening:
        await repo.findScreeningById({
          tenantId:
            auth.tenantId,

          screeningId:
            existing.id,
        }),
    };
  }

  const candidates =
    await repo
      .searchWatchlistEntries({
        subjectName:
          body.subjectName,

        limit: 100,
      });

  const matches = [];

  for (
    const candidate
    of candidates
  ) {
    const aliases =
      candidate.aliases
        ? typeof candidate.aliases ===
          "string"
          ? JSON.parse(
              candidate.aliases
            )
          : candidate.aliases
        : [];

    const names = [
      candidate.primary_name,
      ...aliases,
    ];

    const nameScore =
      Math.max(
        ...names.map(
          (name) =>
            similarity(
              body.subjectName,
              name
            )
        )
      );

    const dobMatch =
      body.dateOfBirth &&
      candidate.date_of_birth
        ? String(
            candidate.date_of_birth
          ).slice(0, 10) ===
          String(
            body.dateOfBirth
          ).slice(0, 10)
        : null;

    const countries =
      candidate.countries
        ? typeof candidate.countries ===
          "string"
          ? JSON.parse(
              candidate.countries
            )
          : candidate.countries
        : [];

    const countryMatch =
      body.countryCode
        ? countries.includes(
            body.countryCode
          )
        : null;

    const ids =
      candidate
        .identification_numbers
        ? typeof candidate
            .identification_numbers ===
          "string"
          ? JSON.parse(
              candidate
                .identification_numbers
            )
          : candidate
              .identification_numbers
        : [];

    const idMatch =
      body.identificationNumber
        ? ids.includes(
            body
              .identificationNumber
          )
        : null;

    let overall =
      nameScore;

    if (dobMatch === true) {
      overall += 15;
    }

    if (
      countryMatch === true
    ) {
      overall += 5;
    }

    if (idMatch === true) {
      overall += 30;
    }

    overall =
      Math.min(
        100,
        overall
      );

    if (
      overall >=
      body.minimumMatchScore
    ) {
      matches.push({
        watchlistEntryId:
          candidate.id,

        listType:
          candidate.list_type,

        primaryName:
          candidate.primary_name,

        nameMatchScore:
          nameScore,

        dateOfBirthMatch:
          dobMatch,

        countryMatch,

        identificationMatch:
          idMatch,

        overallScore:
          Number(
            overall.toFixed(4)
          ),
      });
    }
  }

  const highest =
    matches.length
      ? Math.max(
          ...matches.map(
            (item) =>
              item.overallScore
          )
        )
      : 0;

  const confirmed =
    matches.some(
      (item) =>
        item.identificationMatch ===
          true ||
        item.overallScore >= 95
    );

  const status =
    confirmed
      ? "confirmed_match"
      : matches.length
      ? "potential_match"
      : "clear";

  const screeningId =
    await repo.createScreening({
      tenantId:
        auth.tenantId,

      userId:
        body.userId ||
        auth.userId ||
        null,

      body,

      status,

      highestMatchScore:
        highest,

      matchCount:
        matches.length,

      screenedBy:
        auth.userId,
    });

  for (
    const match
    of matches
  ) {
    await repo
      .createScreeningMatch({
        tenantId:
          auth.tenantId,

        screeningId,

        match,
      });
  }

  let alert = null;

  if (
    status !== "clear"
  ) {
    const hasSanctions =
      matches.some(
        (item) =>
          item.listType ===
          "sanctions"
      );

    alert =
      await repo.createAlert({
        tenantId:
          auth.tenantId,

        userId:
          body.userId ||
          auth.userId ||
          null,

        sourceType:
          "compliance_screening",

        sourceId:
          screeningId,

        alertType:
          hasSanctions
            ? "sanctions_match"
            : "pep_match",

        severity:
          confirmed
            ? "critical"
            : "high",

        score:
          Math.round(
            highest
          ),

        title:
          hasSanctions
            ? "Potential sanctions match"
            : "Potential PEP match",

        description:
          `${matches.length} watchlist match(es) identified.`,

        evidence: {
          screeningId,
          matches,
        },
      });
  }

  return {
    idempotent: false,

    screening:
      await repo
        .findScreeningById({
          tenantId:
            auth.tenantId,

          screeningId,
        }),

    alert,
  };
};

const parseConfig = (
  value
) => {
  if (!value) return {};

  if (
    typeof value ===
    "object"
  ) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const evaluateMonitoringRule =
  async ({
    auth,
    body,
    rule,
    riskProfile,
  }) => {
    const config =
      parseConfig(
        rule.configuration
      );

    switch (
      rule.rule_type
    ) {
      case "amount_threshold":
        return (
          Number(
            body.amount || 0
          ) >=
          Number(
            config.minimumAmount || 0
          )
        );

      case "velocity": {
        const count =
          await repo
            .countRecentTransactions({
              tenantId:
                auth.tenantId,

              userId:
                body.userId,

              eventType:
                body.eventType,

              minutes:
                Number(
                  config.minutes || 60
                ),
            });

        return (
          count >=
          Number(
            config.maximumCount || 10
          )
        );
      }

      case "structuring": {
        const total =
          await repo
            .sumRecentTransactions({
              tenantId:
                auth.tenantId,

              userId:
                body.userId,

              eventType:
                body.eventType,

              hours:
                Number(
                  config.hours || 24
                ),
            });

        return (
          Number(
            body.amount || 0
          ) <
            Number(
              config.reportableThreshold ||
              10000
            ) &&
          total +
            Number(
              body.amount || 0
            ) >=
            Number(
              config.aggregateThreshold ||
              10000
            )
        );
      }

      case "country_risk":
        return (
          config.highRiskCountries ||
          []
        ).includes(
          body.countryCode
        );

      case "customer_profile_deviation":
        return Boolean(
          riskProfile &&
          riskProfile
            .expected_monthly_volume &&
          Number(
            body.amount || 0
          ) >
            Number(
              riskProfile
                .expected_monthly_volume
            ) *
            Number(
              config.multiplier ||
              2
            )
        );

      case "rapid_movement":
        return Boolean(
          body.payload
            ?.fundsReceivedMinutesAgo <=
            Number(
              config.maximumMinutes ||
              30
            )
        );

      case "manual":
        return Boolean(
          body.payload
            ?.manualTrigger ===
            true
        );

      default:
        return false;
    }
  };

const monitorTransaction =
  async ({
    auth,
    body,
  }) => {
    const rules =
      await repo
        .findActiveMonitoringRules({
          tenantId:
            auth.tenantId,

          eventType:
            body.eventType,
        });

    const riskProfile =
      await repo.findRiskProfile({
        tenantId:
          auth.tenantId,

        userId:
          body.userId,
      });

    const matchedRules = [];
    let totalScore = 0;
    let highestSeverity =
      "low";

    const severityRank = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    for (
      const rule
      of rules
    ) {
      const matched =
        await evaluateMonitoringRule({
          auth,
          body,
          rule,
          riskProfile,
        });

      if (!matched) {
        continue;
      }

      totalScore +=
        Number(rule.score);

      matchedRules.push({
        ruleId:
          rule.id,

        code:
          rule.code,

        name:
          rule.name,

        severity:
          rule.severity,

        score:
          Number(
            rule.score
          ),
      });

      if (
        severityRank[
          rule.severity
        ] >
        severityRank[
          highestSeverity
        ]
      ) {
        highestSeverity =
          rule.severity;
      }
    }

    if (!matchedRules.length) {
      return {
        alertCreated: false,
        score: 0,
        matchedRules: [],
      };
    }

    const alert =
      await repo.createAlert({
        tenantId:
          auth.tenantId,

        userId:
          body.userId,

        sourceType:
          body.sourceType,

        sourceId:
          body.sourceId,

        alertType:
          "transaction_monitoring",

        severity:
          highestSeverity,

        score:
          totalScore,

        title:
          `${body.eventType} monitoring alert`,

        description:
          `${matchedRules.length} transaction-monitoring rule(s) matched.`,

        matchedRules,

        evidence: {
          amount:
            body.amount,

          currency:
            body.currency,

          countryCode:
            body.countryCode,

          payload:
            body.payload ||
            null,
        },
      });

    return {
      alertCreated: true,
      score:
        totalScore,
      matchedRules,
      alert,
    };
  };

const createMonitoringRule = ({
  auth,
  body,
}) =>
  repo.createMonitoringRule({
    tenantId:
      auth.tenantId,

    body,

    createdBy:
      auth.userId,
  });

const updateRiskProfile = ({
  auth,
  userId,
  body,
}) =>
  repo.upsertRiskProfile({
    tenantId:
      auth.tenantId,

    userId,

    body,

    reviewedBy:
      auth.userId,
  });

const listAlerts = ({
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

  return repo.listAlerts({
    tenantId:
      auth.tenantId,

    status:
      query.status ||
      null,

    severity:
      query.severity ||
      null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

const updateAlert = async ({
  auth,
  alertId,
  body,
}) => {
  const existing =
    await repo.findAlertById({
      tenantId:
        auth.tenantId,

      alertId,
    });

  if (!existing) {
    throw httpError(
      404,
      "Compliance alert not found"
    );
  }

  if (
    [
      "closed_false_positive",
      "closed_no_action",
      "reported",
    ].includes(
      body.status
    ) &&
    !body.resolutionNote
  ) {
    throw httpError(
      422,
      "A resolution note is required"
    );
  }

  return repo.updateAlert({
    tenantId:
      auth.tenantId,

    alertId,

    body,
  });
};

const createCase = ({
  auth,
  body,
}) =>
  repo.createCase({
    tenantId:
      auth.tenantId,

    userId:
      body.userId ||
      null,

    body,

    createdBy:
      auth.userId,
  });

const getCase = async ({
  auth,
  caseId,
}) => {
  const item =
    await repo.findCaseById({
      tenantId:
        auth.tenantId,

      caseId,
    });

  if (!item) {
    throw httpError(
      404,
      "Compliance case not found"
    );
  }

  return item;
};

const updateCase = async ({
  auth,
  caseId,
  body,
}) => {
  await getCase({
    auth,
    caseId,
  });

  if (
    body.status ===
      "closed" &&
    !body.decisionReason
  ) {
    throw httpError(
      422,
      "A decision reason is required to close the case"
    );
  }

  return repo.updateCase({
    tenantId:
      auth.tenantId,

    caseId,

    body,

    actorUserId:
      auth.userId,
  });
};

const createSar = async ({
  auth,
  caseId,
  body,
}) => {
  const item =
    await getCase({
      auth,
      caseId,
    });

  if (
    item.case.status ===
    "closed"
  ) {
    throw httpError(
      409,
      "Cannot create a report for a closed case"
    );
  }

  return repo.createSar({
    tenantId:
      auth.tenantId,

    caseId,

    body,

    preparedBy:
      auth.userId,
  });
};

module.exports = {
  screen,
  monitorTransaction,
  createMonitoringRule,
  updateRiskProfile,
  listAlerts,
  updateAlert,
  createCase,
  getCase,
  updateCase,
  createSar,
};
