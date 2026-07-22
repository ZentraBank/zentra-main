const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,

  waitForConnections: true,
  connectionLimit: env.database.connectionLimit,
  queueLimit: 0,
});



const testDatabaseConnection = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query("SELECT 1");

    console.log(
      `Connected to MySQL database: ${env.database.name}`
    );

    return true;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const closeDatabaseConnection = async () => {
  await pool.end();
  console.log("MySQL connection pool closed");
};

module.exports = {
  pool,
  testDatabaseConnection,
  closeDatabaseConnection,
};