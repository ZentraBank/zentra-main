const cronParser =
  require("cron-parser");

const {
  getQueue,
} = require("../../config/queue");

const repo =
  require("./jobs.repository");

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

const registerDefinition =
  async (definition) => {
    const queue =
      getQueue(
        definition.queue_name
      );

    const repeatKey =
      `schedule:${definition.id}`;

    await queue.removeRepeatableByKey(
      repeatKey
    ).catch(() => {});

    if (
      definition.status !==
        "active" ||
      definition.schedule_type ===
        "manual"
    ) {
      return;
    }

    const repeat = {
      key: repeatKey,
    };

    if (
      definition.schedule_type ===
      "cron"
    ) {
      repeat.pattern =
        definition.cron_expression;

      repeat.tz =
        definition.timezone;
    } else {
      repeat.every =
        Number(
          definition.interval_seconds
        ) * 1000;
    }

    await queue.add(
      definition.job_name,
      {
        definitionId:
          definition.id,
        jobCode:
          definition.code,
        tenantId:
          definition.tenant_id,
        payload: {
          ...parseJson(
            definition.payload
          ),
          tenantId:
            definition.tenant_id,
        },
        correlationId:
          `repeat:${definition.id}`,
      },
      {
        repeat,
        attempts:
          definition.retry_attempts,
        backoff: {
          type: "exponential",
          delay:
            definition.retry_backoff_ms,
        },
        timeout:
          definition.timeout_ms,
      }
    );

    let nextRunAt = null;

    if (
      definition.schedule_type ===
      "cron"
    ) {
      nextRunAt =
        cronParser
          .parseExpression(
            definition.cron_expression,
            {
              tz:
                definition.timezone,
            }
          )
          .next()
          .toDate();
    } else {
      nextRunAt =
        new Date(
          Date.now() +
          Number(
            definition.interval_seconds
          ) *
          1000
        );
    }

    await repo.markEnqueued({
      definitionId:
        definition.id,
      nextRunAt,
    });
  };

const registerAll =
  async () => {
    const definitions =
      await repo.listDefinitions({
        tenantId: null,
        status: "active",
        queueName: null,
      });

    for (
      const definition
      of definitions
    ) {
      await registerDefinition(
        definition
      );
    }

    return definitions.length;
  };

module.exports = {
  registerDefinition,
  registerAll,
};
