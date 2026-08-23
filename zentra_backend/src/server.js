const http = require("http");

const app = require("./app");
const env = require("./config/env");

const {
  initialiseSocket,
} = require(
  "./realtime/socket"
);

const {
  testDatabaseConnection,
  closeDatabaseConnection,
} = require("./config/db");

let server;
let isShuttingDown = false;

const startServer = async () => {
  try {
    await testDatabaseConnection();

    server =
  http.createServer(app);

/*
 * Attach Socket.IO to the
 * same HTTP server as Express.
 */
initialiseSocket(
  server
);


    server.listen(env.port, () => {
      console.log("---------------------------------------");
      console.log(`${env.appName} started successfully`);
      console.log(`Environment: ${env.nodeEnv}`);
      console.log(`Port: ${env.port}`);
      console.log(
        `API: http://localhost:${env.port}${env.apiPrefix}`
      );
      console.log(
        `Health: http://localhost:${env.port}/health`
      );
      console.log("---------------------------------------");
    });
  } catch (error) {
    console.error(
      "The server could not start:",
      error.message
    );

    process.exit(1);
  }
};

const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  const forceShutdownTimer = setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);

  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      console.log("HTTP server closed");
    }

    await closeDatabaseConnection();

    process.exit(exitCode);
  } catch (error) {
    console.error("Shutdown failed:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);

  shutdown("UNCAUGHT_EXCEPTION", 1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);

  shutdown("UNHANDLED_REJECTION", 1);
});

startServer();