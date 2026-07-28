const crypto =
  require("crypto");

const repo =
  require(
    "../modules/open-banking/open-banking.repository"
  );

const sha256 = (
  value
) =>
  crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");

const partnerAuthenticate =
  async (req, res, next) => {
    try {
      const header =
        req.headers.authorization;

      if (
        !header ||
        !header.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Partner access token is required",
        });
      }

      const rawToken =
        header.slice(7);

      const token =
        await repo
          .findAccessTokenByHash({
            tokenHash:
              sha256(rawToken),
          });

      if (!token) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired partner access token",
        });
      }

      req.partnerAuth = {
        tenantId:
          token.tenant_id,

        partnerApplicationId:
          token.partner_application_id,

        scopes:
          typeof token.scopes ===
          "string"
            ? JSON.parse(
                token.scopes
              )
            : token.scopes,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };

const requirePartnerScopes =
  (...requiredScopes) =>
  (req, res, next) => {
    const granted =
      req.partnerAuth?.scopes ||
      [];

    const missing =
      requiredScopes.filter(
        (scope) =>
          !granted.includes(
            scope
          )
      );

    if (missing.length) {
      return res.status(403).json({
        success: false,
        message:
          "Partner token does not contain the required scopes",
        missingScopes:
          missing,
      });
    }

    return next();
  };

module.exports = {
  partnerAuthenticate,
  requirePartnerScopes,
};
