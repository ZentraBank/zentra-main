const {
  randomUUID,
} = require("crypto");

const {
  getQueue,
} = require("../../config/queue");

const repo =
  require("./jobs.repository");

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
  if (!value) return {};
  if (
    typeof value === "object"
  ) return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const enqueueDefinition = async ({
  definition,
  triggerType,
  triggeredBy,
  overridePayload,
}) => {
  if (
    definition.status !==
      "active" &&
    triggerType !==
      "manual"
  ) {
    throw httpError(
      409,
      "Scheduled job is not active"
    );
  }

  const payload = {
    ...parseJson(
      definition.payload
    ),
    ...overridePayload,
    tenantId:
      definition.tenant_id ||
      overridePayload?.tenantId ||
      null,
  };

  const queue =
    getQueue(
      definition.queue_name
    );

  const correlationId =
    randomUUID();

  const queueJob =
    await queue.add(
      definition.job_name,
      {
        definitionId:
          definition.id,
        jobCode:
          definition.code,
        tenantId:
          payload.tenantId,
        payload,
        correlationId,
      },
      {
        attempts:
          definition.retry_attempts,
        backoff: {
          type: "exponential",
          delay:
            definition.retry_backoff_ms,
        },
        timeout:
          definition.timeout_ms,
        jobId:
          `${definition.code}:${correlationId}`,
      }
    );

  const runId =
    await repo.createRun({
      tenantId:
        payload.tenantId,
      definitionId:
        definition.id,
      queueJobId:
        String(queueJob.id),
      jobCode:
        definition.code,
      jobName:
        definition.job_name,
      triggerType,
      payload,
      triggeredBy,
      correlationId,
    });

  await queueJob.updateData({
    ...queueJob.data,
    runId,
  });

  await repo.markEnqueued({
    definitionId:
      definition.id,
    nextRunAt: null,
  });

  return {
    runId,
    queueJobId:
      String(queueJob.id),
    correlationId,
  };
};

const createDefinition = ({
  auth,
  body,
}) =>
  repo.createDefinition({
    tenantId:
      body.global
        ? null
        : auth.tenantId,
    body,
    createdBy:
      auth.userId,
  });

const listDefinitions = ({
  auth,
  query,
}) =>
  repo.listDefinitions({
    tenantId:
      auth.tenantId,
    status:
      query.status || null,
    queueName:
      query.queueName || null,
  });

const updateDefinitionStatus =
  async ({
    auth,
    definitionId,
    status,
  }) => {
    const definition =
      await repo.findDefinitionById({
        tenantId:
          auth.tenantId,
        definitionId,
        includeGlobal: true,
      });

    if (!definition) {
      throw httpError(
        404,
        "Scheduled job definition not found"
      );
    }

    return repo.updateDefinitionStatus({
      tenantId:
        auth.tenantId,
      definitionId,
      status,
      updatedBy:
        auth.userId,
    });
  };

const runNow = async ({
  auth,
  definitionId,
  body,
}) => {
  const definition =
    await repo.findDefinitionById({
      tenantId:
        auth.tenantId,
      definitionId,
      includeGlobal: true,
    });

  if (!definition) {
    throw httpError(
      404,
      "Scheduled job definition not found"
    );
  }

  return enqueueDefinition({
    definition,
    triggerType: "manual",
    triggeredBy:
      auth.userId,
    overridePayload: {
      ...(body.payload || {}),
      tenantId:
        definition.tenant_id ||
        auth.tenantId,
    },
  });
};

const listRuns = ({
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

  return repo.listRuns({
    tenantId:
      auth.tenantId,
    status:
      query.status || null,
    jobCode:
      query.jobCode || null,
    limit,
    offset:
      (page - 1) * limit,
  });
};

module.exports = {
  enqueueDefinition,
  createDefinition,
  listDefinitions,
  updateDefinitionStatus,
  runNow,
  listRuns,
};
