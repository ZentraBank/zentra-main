const bcrypt =
  require("bcryptjs");

const crypto =
  require("crypto");

const repo =
  require("./donations.repository");

const notifications = require(
  "../notifications/notifications.repository"
);

const {
  emitToUser,
} = require("../../realtime/socket");

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
  query = {},
}) => {
  const parsedPage =
    Number.parseInt(
      query.page,
      10
    );

  const parsedPageSize =
    Number.parseInt(
      query.pageSize,
      10
    );

  const page =
    Number.isInteger(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  const limit =
    Number.isInteger(parsedPageSize) &&
    parsedPageSize > 0
      ? Math.min(
          parsedPageSize,
          100
        )
      : 20;

  /*
   * Customers may only ever see
   * active donors, regardless of
   * query-string manipulation.
   *
   * Tenant admins can use the
   * requested status filter.
   */
  const effectiveStatus =
    auth.roleCode === "customer"
      ? "active"
      : query.status || null;

  return repo.listDonors({
    tenantId:
      auth.tenantId,

    status:
      effectiveStatus,

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

  /*
   * Customers may only retrieve
   * active donors.
   *
   * Tenant admins may retrieve
   * donors in any status so they
   * can manage/edit them.
   */
  if (
    auth.roleCode === "customer" &&
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

    const tenantAdmins =
  await notifications.audienceUsers({
    tenantId:
      auth.tenantId,

    audienceType:
      "role",

    audienceValue:
      "tenant_admin",
  });

for (const admin of tenantAdmins) {
  await notifications.create({
    tenantId:
      auth.tenantId,

    userId:
      admin.user_id,

    notificationType:
      "donation_request_received",

    title:
      "New donation request",

    message:
      `${request.account_name || "A client"} submitted a donation request for ${body.amount} ${body.currency}.`,

    entityType:
      "donation_request",

    entityId:
      request.id,

    priority:
      "high",

    actionUrl:
      `/dashboard/donation?requestId=${request.id}`,

    metadata: {
      donorId:
        donor.id,

      donorName:
        donor.full_name,

      accountId:
        account.id,

      amount:
        body.amount,

      currency:
        body.currency,

      status:
        "pending",
    },
  });
}

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

  await notifications.create({
  tenantId:
    auth.tenantId,

  userId:
    request.beneficiary_user_id,

  notificationType:
    body.status === "approved"
      ? "donation_request_approved"
      : "donation_request_rejected",

  title:
    body.status === "approved"
      ? "Donation request approved"
      : "Donation request rejected",

  message:
    body.status === "approved"
      ? `Your donation request for ${request.amount} ${request.currency} has been approved.`
      : `Your donation request for ${request.amount} ${request.currency} was rejected.${
          body.rejectionReason
            ? ` Reason: ${body.rejectionReason}`
            : ""
        }`,

  entityType:
    "donation_request",

  entityId:
    request.id,

  priority:
    body.status === "rejected"
      ? "high"
      : "normal",

  actionUrl:
  `/donations-gift/donations/donationsdetail?request=${request.id}`,

  metadata: {
    donorId:
      request.donor_id,

    amount:
      request.amount,

    currency:
      request.currency,

    status:
      body.status,

    rejectionReason:
      body.rejectionReason ||
      null,
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

  const existing =
  await repo.findOpenRedemptionByRequest({
    tenantId:
      auth.tenantId,

    requestId:
      request.id,
  });

if (existing) {
  throw httpError(
    409,
    "A redemption already exists for this donation request"
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

  const tenantAdmins =
  await notifications.audienceUsers({
    tenantId:
      auth.tenantId,

    audienceType:
      "role",

    audienceValue:
      "tenant_admin",
  });

for (const admin of tenantAdmins) {
  await notifications.create({
    tenantId:
      auth.tenantId,

    userId:
      admin.user_id,

    notificationType:
      "donation_redemption_requested",

    title:
      "Donation redemption requested",

    message:
      `${request.amount} ${request.currency} donation redemption has been requested.`,

    entityType:
      "donation_redemption",

    entityId:
      redemption.id,

    priority:
      "normal",

    actionUrl:
      `/dashboard/donation?redemptionId=${redemption.id}`,

    metadata: {
      donationRequestId:
        request.id,

      redemptionId:
        redemption.id,

      amount:
        request.amount,

      currency:
        request.currency,

      status:
        "pending_otp",
    },
  });
}

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

    const tenantAdmins =
  await notifications.audienceUsers({
    tenantId:
      auth.tenantId,

    audienceType:
      "role",

    audienceValue:
      "tenant_admin",
  });

for (const admin of tenantAdmins) {
  await notifications.create({
    tenantId:
      auth.tenantId,

    userId:
      admin.user_id,

    notificationType:
      "donation_redemption_verified",

    title:
      "Redemption ready for completion",

    message:
      `${redemption.amount} ${redemption.currency} donation redemption passed OTP verification.`,

    entityType:
      "donation_redemption",

    entityId:
      redemption.id,

    priority:
      "high",

    actionUrl:
      `/dashboard/donation?redemptionId=${redemption.id}`,

    metadata: {
      donationRequestId:
        redemption.donation_request_id,

      redemptionId:
        redemption.id,

      amount:
        redemption.amount,

      currency:
        redemption.currency,

      status:
        "approved",
    },
  });
}

    return verified;
  };

const completeRedemption = async ({
  auth,
  redemptionId,
}) => {
  const connection =
    await repo.db.pool.getConnection();

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

    const request =
      await repo.findDonationRequestForUpdate({
        connection,

        tenantId:
          auth.tenantId,

        requestId:
          redemption.donation_request_id,
      });

    if (!request) {
      throw httpError(
        404,
        "Donation request not found"
      );
    }

    if (
      request.status ===
      "redeemed"
    ) {
      throw httpError(
        409,
        "Donation has already been redeemed"
      );
    }

    if (
      request.account_status !==
      "active"
    ) {
      throw httpError(
        409,
        "Destination account is not active"
      );
    }

    if (
      request.account_currency !==
      redemption.currency
    ) {
      throw httpError(
        409,
        "Redemption currency no longer matches the destination account"
      );
    }

    const amount =
      Number(
        redemption.amount
      );

    const currentBalance =
      Number(
        request.account_balance ||
        0
      );

    const nextBalance =
      currentBalance +
      amount;

    const credited =
      await repo.creditDonationAccount({
        connection,

        tenantId:
          auth.tenantId,

        accountId:
          request.account_id,

        amount,
      });

    if (!credited) {
      throw httpError(
        500,
        "Unable to credit donation to destination account"
      );
    }

    await repo.createDonationLedgerEntry({
      connection,

      tenantId:
        auth.tenantId,

      accountId:
        request.account_id,

      amount,

      balanceAfter:
        nextBalance,

      requestId:
        request.id,

      description:
        `Donation received from ${request.donor_name || 
  "Donation redemption credit"}`,
    });

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

      metadata: {
        amount,
        currency:
          redemption.currency,

        accountId:
          request.account_id,

        balanceAfter:
          nextBalance,
      },
    });

const completedNotificationId =
  await notifications.create({
    connection,

    tenantId:
      auth.tenantId,

    userId:
      request.beneficiary_user_id,

    notificationType:
      "donation_redemption_completed",

    title:
      "Donation credited",

    message:
      `${amount.toFixed(2)} ${redemption.currency} has been credited to your account.`,

    entityType:
      "donation_redemption",

    entityId:
      redemptionId,

    priority:
      "normal",

    actionUrl:
      `/donations-gift/donations/donationsdetail?request=${redemption.donation_request_id}`,

    metadata: {
      donationRequestId:
        redemption.donation_request_id,

      redemptionId,

      accountId:
        request.account_id,

      amount,

      currency:
        redemption.currency,

      balanceAfter:
        nextBalance,

      status:
        "completed",
    },
  });

    await connection.commit();

    const completedNotification =
  await notifications.findById({
    tenantId:
      auth.tenantId,

    notificationId:
      completedNotificationId,
  });

if (completedNotification) {
  emitToUser(
    request.beneficiary_user_id,
    "notification:new",
    completedNotification,
  );
}

    return {
      redemptionId,
      requestId:
        redemption.donation_request_id,

      accountId:
        request.account_id,

      amount,

      currency:
        redemption.currency,

      balanceAfter:
        nextBalance,

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

const listRedemptionsAdmin = async ({
  auth,
  query,
}) => {
  const page =
    Number(query.page) > 0
      ? Number(query.page)
      : 1;

  const pageSize =
    Number(query.pageSize) > 0
      ? Math.min(
          Number(query.pageSize),
          100
        )
      : 20;

  const [
    redemptions,
    total,
  ] =
    await Promise.all([
      repo.listRedemptions({
        tenantId:
          auth.tenantId,

        status:
          query.status || null,

        search:
          query.search || null,

        limit:
          pageSize,

        offset:
          (page - 1) *
          pageSize,
      }),

      repo.countRedemptions({
        tenantId:
          auth.tenantId,

        status:
          query.status || null,

        search:
          query.search || null,
      }),
    ]);

  return {
    redemptions,

    pagination: {
      page,
      pageSize,
      total,
      totalPages:
        Math.ceil(
          total /
          pageSize
        ),
    },
  };
};


module.exports = {
  createDonor,
  listDonors,
  updateDonor,
  getDonor,
  listRedemptionsAdmin,
  createDonationRequest,
  listRequests,
  reviewRequest,
  requestRedemption,
  verifyRedemptionOtp,
  completeRedemption,
};
