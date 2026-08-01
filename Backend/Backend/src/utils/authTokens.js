const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const createAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn || "15m",
    issuer: env.jwt.issuer || "zentrabank-api",
    audience: env.jwt.audience || "zentrabank-client",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret, {
    issuer: env.jwt.issuer || "zentrabank-api",
    audience: env.jwt.audience || "zentrabank-client",
  });
};

const createRefreshToken = () => crypto.randomBytes(64).toString("hex");

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  hashRefreshToken,
};
