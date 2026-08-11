const bcrypt =
  require("bcryptjs");

const crypto =
  require("crypto");

const repo =
  require("./donations.repository");

const httpError = (
  statusCode,
  message
) => {
  const error =
    new Error(message);

  error.statusCode =
    statusCode;

  return error;
};

const createDonor = ({
  auth,
  body,
}) =>
  repo.createDonor({
    tenantId:
      auth.tenantId,

    createdBy:
      auth.userId,

    body,
  });

const listDonors = ({
  auth,
  query,
}) => {
  const page =
    Number(query.page) > 0
      ? Number(query.page)
      : 1;

  const limit =
    Number(query.pageSize) > 0
      ? Math.min(
          Number(query.pageSize),
          100
        )
      : 20;

  return repo.listDonors({
    tenantId:
      auth.tenantId,

    status:
      query.status || null,

    search:
      query.search || null,

    excludeDonorId:
      query.excludeDonorId || null,

    limit,

    offset:
      (page - 1) * limit,
  });
};

const getDonor = async ({
  auth,
  donorId,
}) => {
  const donor =
    await repo.findDonorById({
      tenantId: auth.tenantId,
      donorId,
    });

  if (
    !donor ||
    donor.status !== "active"
  ) {
    throw httpError(
      404,
      "Active donor not found"
    );
  }

  return donor;
};

const updateDonor = async ({
  auth,
  donorId,
  body,
}) => {
  const donor =
    await repo.findDonorById({
      tenantId:
        auth.tenantId,

      donorId,
    });

  if (!donor) {
    throw httpError(
      404,
      "Donor not found"
    );
  }

  return repo.updateDonor({
    tenantId:
      auth.tenantId,

    donorId,

    body,
  });
};

const createDonationRequest =
  async ({
    auth,
    body,
  }) => {
    const donor =
      await repo.findDonorById({
        tenantId:
          auth.tenantId,

        donorId:
          body.donorId,
      });

    if (
      !donor ||
      donor.status !== "active"
    ) {
      throw httpError(
        404,
        "Active donor not found"
      );
    }

    const account =
      await repo.findAccountById({
        tenantId:
          auth.tenantId,

        accountId:
          body.accountId,
      });

    if (
      !account ||
      account.user_id !==
        auth.userId
    ) {
      throw httpError(
        404,
        "Destination account not found"
      );
    }

    if (
      account.status !== "active"
    ) {
      throw httpError(
        403,
        "Destination account is not active"
      );
    }

    if (
      account.currency !==
        body.currency
    ) {
      throw httpError(
        422,
        "Donation currency must match the destination account"
      );
    }

    const request =
      await repo.createDonationRequest({
        tenantId:
          auth.tenantId,

        donorId:
          donor.id,

        beneficiaryUserId:
          auth.userId,

        accountId:
          account.id,

        amount:
          body.amount,

        currency:
          body.currency,

        purpose:
        body.purpose,

      appreciation:
        body.appreciation,
      });

    await repo.createEvent({
      tenantId:
        auth.tenantId,

      requestId:
        request.id,

      actorUserId:
        auth.userId,

      eventType:
        "donation_request_created",

      metadata: {
        amount:
          body.amount,

        currency:
          body.currency,
      },
    });

    return request;
  };

const listRequests = ({
  auth,
  query,
  adminView = false,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listDonationRequests({
    tenantId:
      auth.tenantId,

    userId:
      auth.userId,

    status:
      query.status || null,

    adminView,

    limit,

    offset:
      (page - 1) * limit,
  });
};

const reviewRequest = async ({
  auth,
  requestId,
  body,
}) => {
  const request =
    await repo.findDonationRequestById({
      tenantId:
        auth.tenantId,

      requestId,
    });

  if (!request) {
    throw httpError(
      404,
      "Donation request not found"
    );
  }

  if (
    request.status !== "pending"
  ) {
    throw httpError(
      409,
      `Donation request cannot be reviewed while status is ${request.status}`
    );
  }

  if (
    body.status === "rejected" &&
    !body.rejectionReason
  ) {
    throw httpError(
      422,
      "A rejection reason is required"
    );
  }

  const updated =
    await repo.updateDonationRequestStatus({
      tenantId:
        auth.tenantId,

      requestId,

      status:
        body.status,

      actorUserId:
        auth.userId,

      rejectionReason:
        body.rejectionReason,
    });

  await repo.createEvent({
    tenantId:
      auth.tenantId,

    requestId,

    actorUserId:
      auth.userId,

    eventType:
      `donation_request_${body.status}`,

    metadata: {
      rejectionReason:
        body.rejectionReason || null,
    },
  });

  return updated;
};

const requestRedemption = async ({
  auth,
  requestId,
}) => {
  const request =
    await repo.findDonationRequestById({
      tenantId:
        auth.tenantId,

      requestId,
    });

  if (
    !request ||
    request.beneficiary_user_id !==
      auth.userId
  ) {
    throw httpError(
      404,
      "Donation request not found"
    );
  }

  if (
    request.status !== "funded" &&
    request.status !== "approved"
  ) {
    throw httpError(
      409,
      `Donation cannot be redeemed while status is ${request.status}`
    );
  }

  const otp =
    crypto.randomInt(
      100000,
      1000000
    ).toString();

  const otpHash =
    await bcrypt.hash(
      otp,
      10
    );

  const expiresAt =
    new Date(
      Date.now() +
      10 * 60 * 1000
    );

  const redemption =
    await repo.createRedemption({
      tenantId:
        auth.tenantId,

      requestId:
        request.id,

      userId:
        auth.userId,

      amount:
        request.amount,

      currency:
        request.currency,

      otpHash,

      otpExpiresAt:
        expiresAt,
    });

  await repo.createEvent({
    tenantId:
      auth.tenantId,

    requestId:
      request.id,

    redemptionId:
      redemption.id,

    actorUserId:
      auth.userId,

    eventType:
      "donation_redemption_requested",
  });

  return {
    redemptionId:
      redemption.id,

    expiresAt,

    developmentOtp:
      process.env.NODE_ENV ===
      "production"
        ? undefined
        : otp,
  };
};

const verifyRedemptionOtp =
  async ({
    auth,
    redemptionId,
    otp,
  }) => {
    const redemption =
      await repo.findRedemptionById({
        tenantId:
          auth.tenantId,

        redemptionId,
      });

    if (
      !redemption ||
      redemption.user_id !==
        auth.userId
    ) {
      throw httpError(
        404,
        "Redemption request not found"
      );
    }

    if (
      redemption.status !==
        "pending_otp"
    ) {
      throw httpError(
        409,
        "This redemption OTP can no longer be used"
      );
    }

    if (
      redemption.otp_attempts >= 5
    ) {
      throw httpError(
        429,
        "Maximum OTP attempts exceeded"
      );
    }

    if (
      new Date(
        redemption.otp_expires_at
      ) < new Date()
    ) {
      throw httpError(
        410,
        "Redemption OTP has expired"
      );
    }

    const valid =
      await bcrypt.compare(
        otp,
        redemption.otp_hash
      );

    if (!valid) {
      await repo.incrementOtpAttempts({
        tenantId:
          auth.tenantId,

        redemptionId,
      });

      throw httpError(
        422,
        "Invalid redemption OTP"
      );
    }

    const verified =
      await repo.markOtpVerified({
        tenantId:
          auth.tenantId,

        redemptionId,
      });

    await repo.createEvent({
      tenantId:
        auth.tenantId,

      requestId:
        redemption.donation_request_id,

      redemptionId,

      actorUserId:
        auth.userId,

      eventType:
        "donation_redemption_otp_verified",
    });

    return verified;
  };

const completeRedemption =
  async ({
    auth,
    redemptionId,
  }) => {
    const connection =
      await repo.db.getConnection();

    try {
      await connection.beginTransaction();

      const redemption =
        await repo.findRedemptionById({
          tenantId:
            auth.tenantId,

          redemptionId,
        });

      if (!redemption) {
        throw httpError(
          404,
          "Redemption request not found"
        );
      }

      if (
        redemption.status !==
          "approved"
      ) {
        throw httpError(
          409,
          "Redemption must pass OTP verification before completion"
        );
      }

      await repo.completeRedemption({
        connection,

        tenantId:
          auth.tenantId,

        redemptionId,

        requestId:
          redemption.donation_request_id,
      });

      await repo.createEvent({
        connection,

        tenantId:
          auth.tenantId,

        requestId:
          redemption.donation_request_id,

        redemptionId,

        actorUserId:
          auth.userId,

        eventType:
          "donation_redemption_completed",
      });

      await connection.commit();

      return {
        redemptionId,
        status:
          "completed",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

module.exports = {
  createDonor,
  listDonors,
  updateDonor,
  getDonor,
  createDonationRequest,
  listRequests,
  reviewRequest,
  requestRedemption,
  verifyRedemptionOtp,
  completeRedemption,
  createDonationRequest,
  listRequests,
  reviewRequest,
  requestRedemption,
  verifyRedemptionOtp,
  completeRedemption,
};
