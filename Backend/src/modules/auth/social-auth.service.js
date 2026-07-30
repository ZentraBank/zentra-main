const jwt = require("jsonwebtoken");
const env = require("../../config/env");

const SUPPORTED_PROVIDERS = new Set(["google", "facebook"]);

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const safeNextPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";

const getProviderConfig = (provider) => {
  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw createHttpError(400, "Unsupported social login provider");
  }

  const config = env.socialAuth[provider];
  if (!config?.clientId || !config?.clientSecret) {
    throw createHttpError(503, `${provider} login is not configured`);
  }

  return config;
};

const createState = ({ tenantId, tenantSlug, next, callbackUrl }) =>
  jwt.sign(
    {
      type: "social_login_state",
      tenantId,
      tenantSlug,
      next: safeNextPath(next),
      callbackUrl,
    },
    env.jwt.accessSecret,
    { expiresIn: "10m", issuer: "zentrabank-api", audience: "social-login" }
  );

const verifyState = (state) => {
  try {
    const payload = jwt.verify(state, env.jwt.accessSecret, {
      issuer: "zentrabank-api",
      audience: "social-login",
    });
    if (payload.type !== "social_login_state") throw new Error("Invalid state type");
    return payload;
  } catch {
    throw createHttpError(400, "Social login state is invalid or expired");
  }
};

const buildAuthorizationUrl = ({ provider, state, callbackUrl }) => {
  const config = getProviderConfig(provider);

  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "email,public_profile",
    state,
  });
  return `https://www.facebook.com/${config.apiVersion}/dialog/oauth?${params.toString()}`;
};

const exchangeGoogleCode = async ({ code, callbackUrl }) => {
  const config = getProviderConfig("google");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await response.json();
  if (!response.ok || !tokens.id_token) {
    throw createHttpError(401, "Google login could not be verified");
  }

  const profileResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokens.id_token)}`
  );
  const profile = await profileResponse.json();
  if (!profileResponse.ok || profile.aud !== config.clientId || profile.email_verified !== "true") {
    throw createHttpError(401, "Google did not return a verified email address");
  }

  return { email: profile.email, name: profile.name || null, providerUserId: profile.sub };
};

const exchangeFacebookCode = async ({ code, callbackUrl }) => {
  const config = getProviderConfig("facebook");
  const tokenParams = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: callbackUrl,
    code,
  });
  const tokenResponse = await fetch(
    `https://graph.facebook.com/${config.apiVersion}/oauth/access_token?${tokenParams.toString()}`
  );
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) {
    throw createHttpError(401, "Facebook login could not be verified");
  }

  const profileResponse = await fetch(
    `https://graph.facebook.com/${config.apiVersion}/me?fields=id,name,email&access_token=${encodeURIComponent(tokenData.access_token)}`
  );
  const profile = await profileResponse.json();
  if (!profileResponse.ok || !profile.email) {
    throw createHttpError(401, "Facebook did not return an email address");
  }

  return { email: profile.email, name: profile.name || null, providerUserId: profile.id };
};

const exchangeCode = ({ provider, code, callbackUrl }) => {
  if (provider === "google") return exchangeGoogleCode({ code, callbackUrl });
  if (provider === "facebook") return exchangeFacebookCode({ code, callbackUrl });
  throw createHttpError(400, "Unsupported social login provider");
};

const getAvailability = () => ({
  google: Boolean(env.socialAuth.google.clientId && env.socialAuth.google.clientSecret),
  facebook: Boolean(env.socialAuth.facebook.clientId && env.socialAuth.facebook.clientSecret),
});

module.exports = {
  safeNextPath,
  createState,
  verifyState,
  buildAuthorizationUrl,
  exchangeCode,
  getAvailability,
};
