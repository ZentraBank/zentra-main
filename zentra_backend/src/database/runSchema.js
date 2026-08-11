const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const env = require("../config/env");

const runSchema = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: env.database.host,
      port: env.database.port,
      user: env.database.user,
      password: env.database.password,
      multipleStatements: true,
    });

    await connection.query(
      `
        CREATE DATABASE IF NOT EXISTS \`${env.database.name}\`
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
      `
    );

    await connection.changeUser({
      database: env.database.name,
    });

    const schemaPath = path.resolve(
      __dirname,
      "schema.sql"
    );

    const schema = fs.readFileSync(schemaPath, "utf8");

    await connection.query(schema);

    console.log("---------------------------------------");
    console.log("Database schema created successfully");
    console.log(`Database: ${env.database.name}`);
    console.log("---------------------------------------");
  } catch (error) {
    console.error("Schema creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

runSchema();