const http =
  require("http");

const app =
  require("./app");

const env =
  require("./config/env");

const {
  initialiseSocket,
} = require(
  "./realtime/socket"
);

const {
  testDatabaseConnection,
  closeDatabaseConnection,
} = require(
  "./config/db"
);

const investmentService =
  require(
    "./modules/investments/investments.service"
  );

let server;
let investmentMaturityTimer = null;

let isShuttingDown =
  false;

const ONE_HOUR =
  60 * 60 * 1000;

/*
|--------------------------------------------------------------------------
| Automatic investment maturity
|--------------------------------------------------------------------------
*/

const runInvestmentMaturityCheck =
  async () => {
    try {
      const count =
        await investmentService.markAllMatured();

      if (count > 0) {
        console.log(
          `[Investments] ${count} investment(s) automatically marked as matured`
        );
      }
    } catch (error) {
      console.error(
        "[Investments] Automatic maturity check failed:",
        error
      );
    }
  };

const startInvestmentMaturityScheduler =
  () => {
    /*
     * Run immediately once the
     * backend is successfully up.
     */
    void runInvestmentMaturityCheck();

    /*
     * Then check once every hour.
     */
    investmentMaturityTimer =
      setInterval(
        () => {
          void runInvestmentMaturityCheck();
        },
        ONE_HOUR
      );

    console.log(
      "[Investments] Automatic maturity scheduler started"
    );
  };

const stopInvestmentMaturityScheduler =
  () => {
    if (
      !investmentMaturityTimer
    ) {
      return;
    }

    clearInterval(
      investmentMaturityTimer
    );

    investmentMaturityTimer =
      null;

    console.log(
      "[Investments] Automatic maturity scheduler stopped"
    );
  };

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

const startServer =
  async () => {
    try {
      await testDatabaseConnection();

      server =
        http.createServer(
          app
        );

      /*
       * Attach Socket.IO to the
       * same HTTP server as Express.
       */
      initialiseSocket(
        server
      );

      server.listen(
        env.port,
        () => {
          console.log(
            "---------------------------------------"
          );

          console.log(
            `${env.appName} started successfully`
          );

          console.log(
            `Environment: ${env.nodeEnv}`
          );

          console.log(
            `Port: ${env.port}`
          );

          console.log(
            `API: http://localhost:${env.port}${env.apiPrefix}`
          );

          console.log(
            `Health: http://localhost:${env.port}/health`
          );

          console.log(
            "---------------------------------------"
          );

          /*
           * Only start automatic
           * maturity after the HTTP
           * server is successfully
           * listening.
           */
          startInvestmentMaturityScheduler();
        }
      );
    } catch (error) {
      console.error(
        "The server could not start:",
        error.message
      );

      process.exit(1);
    }
  };

/*
|--------------------------------------------------------------------------
| Graceful shutdown
|--------------------------------------------------------------------------
*/

const shutdown =
  async (
    signal,
    exitCode = 0
  ) => {
    if (
      isShuttingDown
    ) {
      return;
    }

    isShuttingDown =
      true;

    console.log(
      `${signal} received. Shutting down...`
    );

    /*
     * Stop recurring jobs before
     * closing the server/database.
     */
    stopInvestmentMaturityScheduler();

    const forceShutdownTimer =
      setTimeout(
        () => {
          console.error(
            "Forced shutdown after timeout"
          );

          process.exit(1);
        },
        10000
      );

    forceShutdownTimer.unref();

    try {
      if (server) {
        await new Promise(
          (
            resolve,
            reject
          ) => {
            server.close(
              (error) => {
                if (error) {
                  reject(
                    error
                  );

                  return;
                }

                resolve();
              }
            );
          }
        );

        console.log(
          "HTTP server closed"
        );
      }

      await closeDatabaseConnection();

      clearTimeout(
        forceShutdownTimer
      );

      process.exit(
        exitCode
      );
    } catch (error) {
      console.error(
        "Shutdown failed:",
        error
      );

      process.exit(1);
    }
  };

/*
|--------------------------------------------------------------------------
| Process signals
|--------------------------------------------------------------------------
*/

process.on(
  "SIGINT",
  () => {
    void shutdown(
      "SIGINT"
    );
  }
);

process.on(
  "SIGTERM",
  () => {
    void shutdown(
      "SIGTERM"
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught exception:",
      error
    );

    void shutdown(
      "UNCAUGHT_EXCEPTION",
      1
    );
  }
);

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "Unhandled promise rejection:",
      reason
    );

    void shutdown(
      "UNHANDLED_REJECTION",
      1
    );
  }
);

void startServer();