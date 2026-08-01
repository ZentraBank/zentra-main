const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const env = require("../config/env");

const signAccessToken = ({
  userId,
  tenantId,
  membershipId,
  roleCode,
}) => {
  return jwt.sign(
    {
      tenantId,
      membershipId,
      roleCode,
      tokenType: "access",
    },
    env.jwt.accessSecret,
    {
      subject: userId,
      expiresIn: env.jwt.accessExpiresIn,
      issuer: env.appName,
      audience: "zentrabank-client",
    }
  );
};

const signRefreshToken = ({
  userId,
  tenantId,
  tokenId,
}) => {
  return jwt.sign(
    {
      tenantId,
      tokenType: "refresh",
    },
    env.jwt.refreshSecret,
    {
      subject: userId,
      jwtid: tokenId,
      expiresIn: env.jwt.refreshExpiresIn,
      issuer: env.appName,
      audience: "zentrabank-client",
    }
  );
};

const verifyAccessToken = (token) => {
  const payload = jwt.verify(
    token,
    env.jwt.accessSecret,
    {
      issuer: env.appName,
      audience: "zentrabank-client",
    }
  );

  if (payload.tokenType !== "access") {
    const error = new Error(
      "The supplied token is not an access token"
    );

    error.name = "JsonWebTokenError";
    throw error;
  }

  return payload;
};

const verifyRefreshToken = (token) => {
  const payload = jwt.verify(
    token,
    env.jwt.refreshSecret,
    {
      issuer: env.appName,
      audience: "zentrabank-client",
    }
  );

  if (payload.tokenType !== "refresh") {
    const error = new Error(
      "The supplied token is not a refresh token"
    );

    error.name = "JsonWebTokenError";
    throw error;
  }

  return payload;
};

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const decodeTokenExpiration = (token) => {
  const decoded = jwt.decode(token);

  if (!decoded?.exp) {
    throw new Error(
      "Unable to determine token expiration"
    );
  }

  return new Date(decoded.exp * 1000);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  decodeTokenExpiration,
};