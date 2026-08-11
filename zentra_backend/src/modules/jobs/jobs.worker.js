const os =
  require("os");

const {
  Worker,
} = require("bullmq");

const {
  connection,
} = require("../../config/queue");

const {
  QUEUES,
} = require("./jobs.constants");

const {
  getHandler,
} = require("./jobs.registry");

const repo =
  require("./jobs.repository");

const workerId =
  `${os.hostname()}:${process.pid}`;

const processJob =
  async (job) => {
    const startedAt =
      Date.now();

    const {
      runId,
      tenantId,
      jobCode,
      payload,
    } = job.data;

    const lockKey =
      `job:${tenantId || "global"}:${jobCode}`;

    const acquired =
      await repo.acquireLock({
        lockKey,
        ownerId:
          workerId,
        ttlSeconds:
          Math.ceil(
            (
              job.opts.timeout ||
              300000
            ) / 1000
          ) + 60,
      });

    if (!acquired) {
      const error =
        new Error(
          "Another worker already holds this job lock"
        );

      error.code =
        "JOB_LOCKED";

      throw error;
    }

    try {
      await repo.markRunProcessing({
        runId,
        attemptNumber:
          job.attemptsMade + 1,
      });

      const handler =
        getHandler(job.name);

      const result =
        await handler({
          tenantId,
          payload:
            payload || {},
          job,
        });

      await repo.markRunCompleted({
        runId,
        result,
        durationMs:
          Date.now() -
          startedAt,
      });

      return result;
    } catch (error) {
      const finalAttempt =
        job.attemptsMade + 1 >=
        Number(
          job.opts.attempts || 1
        );

      await repo.markRunFailed({
        runId,
        error,
        durationMs:
          Date.now() -
          startedAt,
        deadLetter:
          finalAttempt,
      });

      if (finalAttempt) {
        await repo.createDeadLetter({
          tenantId,
          runId,
          jobCode,
          payload,
          error,
          retryCount:
            job.attemptsMade + 1,
        });
      }

      throw error;
    } finally {
      await repo.releaseLock({
        lockKey,
        ownerId:
          workerId,
      });
    }
  };

const createWorker = (
  queueName,
  concurrency
) => {
  const worker =
    new Worker(
      queueName,
      processJob,
      {
        connection,
        concurrency,
      }
    );

  worker.on(
    "error",
    (error) => {
      console.error(
        `[jobs:${queueName}] worker error`,
        error
      );
    }
  );

  return worker;
};

const workers = [
  createWorker(
    QUEUES.BANKING,
    Number(
      process.env
        .BANKING_JOB_CONCURRENCY ||
      5
    )
  ),

  createWorker(
    QUEUES.MAINTENANCE,
    Number(
      process.env
        .MAINTENANCE_JOB_CONCURRENCY ||
      2
    )
  ),

  createWorker(
    QUEUES.NOTIFICATIONS,
    Number(
      process.env
        .NOTIFICATION_JOB_CONCURRENCY ||
      10
    )
  ),
];

const shutdown =
  async () => {
    await Promise.all(
      workers.map(
        (worker) =>
          worker.close()
      )
    );
  };

process.on(
  "SIGTERM",
  shutdown
);

process.on(
  "SIGINT",
  shutdown
);

module.exports = {
  workers,
  shutdown,
};
