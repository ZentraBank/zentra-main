const { Queue, QueueEvents } = require("bullmq");
const Redis = require("ioredis");

// Check if REDIS_URL is configured
const redisUrl = process.env.REDIS_URL;
let connection = null;
let isRedisAvailable = false;

if (redisUrl) {
  try {
    connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    
    // Catch unhandled errors silently or log a warning instead of crashing
    connection.on("error", (err) => {
      console.warn("⚠️ Redis connection warning:", err.message);
    });

    isRedisAvailable = true;
  } catch (err) {
    console.warn("⚠️ Failed to initialize Redis connection.");
  }
} else {
  console.log("ℹ️ REDIS_URL not found. Background queues will be disabled or mocked.");
}

const defaultJobOptions = {
  removeOnComplete: {
    age: 60 * 60 * 24 * 7,
    count: 10000,
  },
  removeOnFail: {
    age: 60 * 60 * 24 * 30,
    count: 50000,
  },
};

const queues = new Map();
const queueEvents = new Map();

const getQueue = (queueName) => {
  if (!isRedisAvailable) {
    // Return a safe mock object so code calling queue.add() doesn't throw a TypeError
    return {
      add: async () => {
        console.warn(`[Mock Queue] Job not added to '${queueName}' because Redis is offline.`);
        return null;
      },
    };
  }

  if (!queues.has(queueName)) {
    queues.set(
      queueName,
      new Queue(queueName, {
        connection,
        defaultJobOptions,
      })
    );
  }

  return queues.get(queueName);
};

const getQueueEvents = (queueName) => {
  if (!isRedisAvailable) {
    return {
      on: () => {},
      off: () => {},
    };
  }

  if (!queueEvents.has(queueName)) {
    queueEvents.set(
      queueName,
      new QueueEvents(queueName, { connection })
    );
  }

  return queueEvents.get(queueName);
};

module.exports = {
  connection,
  getQueue,
  getQueueEvents,
};