module.exports = {
  apps: [
    {
      name: "zentrabank-api",
      script: "src/server.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};