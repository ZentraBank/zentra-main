const env = require("../../../config/env");

const CLOUDFLARE_API_BASE =
  "https://api.cloudflare.com/client/v4";

const ensureConfigured = () => {
  if (!env.cloudflare?.apiToken) {
    throw new Error(
      "Cloudflare API token is not configured."
    );
  }

  if (!env.cloudflare?.zoneId) {
    throw new Error(
      "Cloudflare zone ID is not configured."
    );
  }
};

const cloudflareRequest = async (
  path,
  options = {}
) => {
  ensureConfigured();

  const response = await fetch(
    `${CLOUDFLARE_API_BASE}${path}`,
    {
      ...options,

      headers: {
        Authorization:
          `Bearer ${env.cloudflare.apiToken}`,

        "Content-Type":
          "application/json",

        ...(options.headers || {}),
      },
    }
  );

  const payload =
    await response.json();

  if (
    !response.ok ||
    payload.success === false
  ) {
    const message =
      payload.errors
        ?.map(
          (error) =>
            error.message
        )
        .filter(Boolean)
        .join("; ") ||
      "Cloudflare request failed.";

    const error =
      new Error(message);

    error.statusCode =
      response.status;

    error.cloudflareErrors =
      payload.errors || [];

    throw error;
  }

  return payload.result;
};

const createCustomHostname = async ({
  hostname,
  tenantId,
}) => {
  return cloudflareRequest(
    `/zones/${env.cloudflare.zoneId}/custom_hostnames`,
    {
      method: "POST",

      body: JSON.stringify({
        hostname,

        custom_metadata: {
          tenantId,
        },

        ssl: {
          method: "txt",
          type: "dv",
          settings: {
            min_tls_version:
              "1.2",
          },
        },
      }),
    }
  );
};

const getCustomHostname = async (
  customHostnameId
) => {
  return cloudflareRequest(
    `/zones/${env.cloudflare.zoneId}/custom_hostnames/${customHostnameId}`,
    {
      method: "GET",
    }
  );
};

const deleteCustomHostname = async (
  customHostnameId
) => {
  return cloudflareRequest(
    `/zones/${env.cloudflare.zoneId}/custom_hostnames/${customHostnameId}`,
    {
      method: "DELETE",
    }
  );
};

const getFallbackOrigin =
  async () => {
    return cloudflareRequest(
      `/zones/${env.cloudflare.zoneId}/custom_hostnames/fallback_origin`,
      {
        method: "GET",
      }
    );
  };

module.exports = {
  createCustomHostname,
  getCustomHostname,
  deleteCustomHostname,
  getFallbackOrigin,
};