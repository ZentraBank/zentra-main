const dns = require("dns").promises;

const env = require("../../config/env");
const cloudflareProvider =
  require(
    "./providers/cloudflare-domain.provider"
  );

const normaliseDomain = (domain) =>
  String(domain || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");

/*
|--------------------------------------------------------------------------
| Check whether traffic is pointing to ZentraBank
|--------------------------------------------------------------------------
|
| For subdomains we expect a CNAME such as:
|
| bank.acme.com
|      ↓
| domains.zentrabank.app
|
| Apex/root domains may eventually require ALIAS / ANAME / A records
| depending on the DNS provider. We keep that infrastructure-specific
| handling out of this service for now.
|
*/

const verifyCnameConnection = async ({
  domain,
  expectedTarget,
}) => {
  const hostname =
    normaliseDomain(domain);

  const expected =
    normaliseDomain(expectedTarget);

  try {
    const records =
      await dns.resolveCname(
        hostname
      );

    const normalisedRecords =
      records.map(
        normaliseDomain
      );

    return {
      connected:
        normalisedRecords.includes(
          expected
        ),

      records:
        normalisedRecords,
    };
  } catch (error) {
    if (
      error?.code === "ENODATA" ||
      error?.code === "ENOTFOUND" ||
      error?.code === "ESERVFAIL"
    ) {
      return {
        connected: false,
        records: [],
      };
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Provision domain
|--------------------------------------------------------------------------
|
| This is intentionally provider-neutral.
|
| At this stage ZentraBank verifies the DNS connection and marks the
| domain ready for infrastructure provisioning.
|
| Later this function can delegate to:
|
| Cloudflare
| AWS
| Azure
| Vercel
| custom reverse proxy infrastructure
|
*/
const getConnectionInstructions = ({
  domain,
}) => {
  const targetHost =
    `domains.${
      env.tenantTemporaryDomain ||
      "zentrabank.app"
    }`;

  return {
    domain:
      normaliseDomain(domain),

    record: {
      type:
        "CNAME",

      host:
        normaliseDomain(domain),

      value:
        targetHost,
    },

    targetHost,
  };
};



const provisionDomain = async ({
  tenantId,
  domain,
}) => {
  const result =
    await cloudflareProvider
      .createCustomHostname({
        hostname:
          domain.domain,

        tenantId,
      });

  return {
    success: true,

    provider:
      "cloudflare",

    providerHostnameId:
      result.id,

    hostname:
      result.hostname,

    status:
      result.status,

    ssl:
      result.ssl || null,

    ownershipVerification:
      result.ownership_verification ||
      null,

    ownershipVerificationHttp:
      result.ownership_verification_http ||
      null,
  };
};

const getDomainStatus = async ({
  providerHostnameId,
}) => {
  const result =
    await cloudflareProvider
      .getCustomHostname(
        providerHostnameId
      );

  return {
    provider:
      "cloudflare",

    id:
      result.id,

    hostname:
      result.hostname,

    status:
      result.status,

    ssl:
      result.ssl || null,

    ownershipVerification:
      result.ownership_verification ||
      null,

    ownershipVerificationHttp:
      result.ownership_verification_http ||
      null,
  };
};

const deleteDomain = async ({
  providerHostnameId,
}) => {
  if (!providerHostnameId) {
    return;
  }

  await cloudflareProvider
    .deleteCustomHostname(
      providerHostnameId
    );
};


module.exports = {
  verifyCnameConnection,
  provisionDomain,
  getConnectionInstructions,
  provisionDomain,
  getDomainStatus,
  deleteDomain,
};