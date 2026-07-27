const repo =
  require(
    "../modules/kyc/kyc.repository"
  );

const requireApprovedKyc =
  async (
    req,
    res,
    next
  ) => {
    try {
      const profile =
        await repo.findByUser({
          tenantId:
            req.auth.tenantId,

          userId:
            req.auth.userId,
        });

      if (
        !profile ||
        profile.status !==
          "approved"
      ) {
        const error =
          new Error(
            "Approved KYC verification is required"
          );

        error.statusCode =
          403;

        return next(
          error
        );
      }

      req.kyc =
        profile;

      return next();
    } catch (error) {
      return next(
        error
      );
    }
  };

module.exports = {
  requireApprovedKyc,
};
