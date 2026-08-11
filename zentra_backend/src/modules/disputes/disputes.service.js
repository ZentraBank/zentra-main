const repo =
  require("./disputes.repository");

const ledgerService =
  require("../ledger/ledger.service");

const eventsService =
  require("../events/events.service");

const httpError = (
  statusCode,
  message
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createDispute = async ({
  auth,
  body,
}) => {
  const dispute =
    await repo.createDispute({
      tenantId:
        auth.tenantId,
      userId:
        auth.userId,
      body,
    });

  await repo.addEvent({
    tenantId:
      auth.tenantId,
    disputeId:
      dispute.id,
    eventType:
      "dispute_submitted",
    actorUserId:
      auth.userId,
    actorType:
      "customer",
    note:
      body.reasonDescription,
  });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "dispute.submitted",
    aggregateType:
      "dispute",
    aggregateId:
      dispute.id,
    idempotencyKey:
      `dispute:${dispute.id}:submitted:v1`,
    payload: {
      disputeId:
        dispute.id,
      reference:
        dispute.dispute_reference,
      amount:
        dispute.disputed_amount,
      currency:
        dispute.currency,
    },
  });

  return dispute;
};

const getDispute = async ({
  auth,
  disputeId,
}) => {
  const dispute =
    await repo.findDisputeById({
      tenantId:
        auth.tenantId,
      disputeId,
    });

  if (!dispute) {
    throw httpError(
      404,
      "Dispute case not found"
    );
  }

  const [events, evidence] =
    await Promise.all([
      repo.listEvents({
        tenantId:
          auth.tenantId,
        disputeId,
      }),
      repo.listEvidence({
        tenantId:
          auth.tenantId,
        disputeId,
      }),
    ]);

  return {
    dispute,
    events,
    evidence,
  };
};

const listDisputes = ({
  auth,
  query,
  mine = false,
}) => {
  const page =
    Number(query.page);

  const limit =
    Math.min(
      Number(query.pageSize),
      100
    );

  return repo.listDisputes({
    tenantId:
      auth.tenantId,
    userId:
      mine
        ? auth.userId
        : query.userId || null,
    status:
      query.status || null,
    priority:
      query.priority || null,
    limit,
    offset:
      (page - 1) * limit,
  });
};

const updateDispute = async ({
  auth,
  disputeId,
  body,
}) => {
  const existing =
    await repo.findDisputeById({
      tenantId:
        auth.tenantId,
      disputeId,
    });

  if (!existing) {
    throw httpError(
      404,
      "Dispute case not found"
    );
  }

  if (
    [
      "resolved_customer",
      "resolved_merchant",
      "closed",
    ].includes(
      body.status
    ) &&
    !body.resolutionSummary
  ) {
    throw httpError(
      422,
      "A resolution summary is required"
    );
  }

  const updated =
    await repo.updateDispute({
      tenantId:
        auth.tenantId,
      disputeId,
      body,
    });

  await repo.addEvent({
    tenantId:
      auth.tenantId,
    disputeId,
    eventType:
      body.status
        ? `status_${body.status}`
        : "dispute_updated",
    actorUserId:
      auth.userId,
    actorType:
      "staff",
    note:
      body.resolutionSummary,
    metadata: body,
  });

  return updated;
};

const addEvidence = async ({
  auth,
  disputeId,
  body,
  submitterType,
}) => {
  await getDispute({
    auth,
    disputeId,
  });

  const evidence =
    await repo.addEvidence({
      tenantId:
        auth.tenantId,
      disputeId,
      body,
      submittedBy:
        auth.userId,
      submitterType,
    });

  await repo.addEvent({
    tenantId:
      auth.tenantId,
    disputeId,
    eventType:
      "evidence_submitted",
    actorUserId:
      auth.userId,
    actorType:
      submitterType,
    metadata: {
      evidenceId:
        evidence.id,
      evidenceType:
        evidence.evidence_type,
    },
  });

  return evidence;
};

const reviewEvidence = async ({
  auth,
  evidenceId,
  body,
}) => {
  const evidence =
    await repo.findEvidenceById({
      tenantId:
        auth.tenantId,
      evidenceId,
    });

  if (!evidence) {
    throw httpError(
      404,
      "Dispute evidence not found"
    );
  }

  return repo.reviewEvidence({
    tenantId:
      auth.tenantId,
    evidenceId,
    body,
    reviewedBy:
      auth.userId,
  });
};

const createAndPostRefund = async ({
  auth,
  disputeId,
  body,
}) => {
  const dispute =
    await repo.findDisputeById({
      tenantId:
        auth.tenantId,
      disputeId,
    });

  if (!dispute) {
    throw httpError(
      404,
      "Dispute case not found"
    );
  }

  const existing =
    await repo.findRefundByIdempotency({
      tenantId:
        auth.tenantId,
      idempotencyKey:
        body.idempotencyKey,
    });

  if (existing) {
    return {
      idempotent: true,
      refund: existing,
    };
  }

  if (
    Number(body.amount) >
    Number(dispute.disputed_amount)
  ) {
    throw httpError(
      422,
      "Refund cannot exceed the disputed amount"
    );
  }

  const refund =
    await repo.createRefund({
      tenantId:
        auth.tenantId,
      disputeId,
      body,
      createdBy:
        auth.userId,
    });

  const journal =
    await ledgerService.postJournal({
      auth,
      body: {
        reference:
          `DISPUTE-${refund.id}`,
        idempotencyKey:
          `dispute-refund:${refund.id}:post`,
        transactionType:
          "dispute_refund",
        description:
          body.reason ||
          `Dispute refund for ${dispute.dispute_reference}`,
        sourceType:
          "dispute_refund",
        sourceId:
          refund.id,
        entries: [
          {
            ledgerAccountId:
              body.offsetLedgerAccountId,
            entryType: "debit",
            amount:
              body.amount,
            currency:
              body.currency,
          },
          {
            ledgerAccountId:
              body.customerLedgerAccountId,
            entryType: "credit",
            amount:
              body.amount,
            currency:
              body.currency,
          },
        ],
      },
    });

  const posted =
    await repo.markRefundPosted({
      tenantId:
        auth.tenantId,
      refundId:
        refund.id,
      journalId:
        journal.journal.id,
    });

  await repo.updateDisputeRefundFields({
    tenantId:
      auth.tenantId,
    disputeId,
    refund: posted,
  });

  await repo.addEvent({
    tenantId:
      auth.tenantId,
    disputeId,
    eventType:
      `${body.refundType}_posted`,
    actorUserId:
      auth.userId,
    actorType:
      "staff",
    metadata: {
      refundId:
        posted.id,
      journalId:
        posted.journal_id,
      amount:
        posted.amount,
      currency:
        posted.currency,
    },
  });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      body.refundType ===
        "provisional_credit"
        ? "dispute.provisional_credit_issued"
        : "dispute.refund_posted",
    aggregateType:
      "dispute",
    aggregateId:
      disputeId,
    idempotencyKey:
      `dispute:${disputeId}:refund:${posted.id}:v1`,
    payload: {
      disputeId,
      refundId:
        posted.id,
      amount:
        posted.amount,
      currency:
        posted.currency,
      refundType:
        posted.refund_type,
    },
  });

  return {
    idempotent: false,
    refund: posted,
  };
};

const createChargeback = async ({
  auth,
  disputeId,
  body,
}) => {
  const dispute =
    await repo.findDisputeById({
      tenantId:
        auth.tenantId,
      disputeId,
    });

  if (!dispute) {
    throw httpError(
      404,
      "Dispute case not found"
    );
  }

  const chargeback =
    await repo.createChargeback({
      tenantId:
        auth.tenantId,
      disputeId,
      body,
    });

  await repo.addEvent({
    tenantId:
      auth.tenantId,
    disputeId,
    eventType:
      "chargeback_filed",
    actorUserId:
      auth.userId,
    actorType:
      "staff",
    metadata: {
      chargebackId:
        chargeback.id,
      reference:
        chargeback.chargeback_reference,
    },
  });

  return chargeback;
};

const updateChargeback = async ({
  auth,
  chargebackId,
  body,
}) => {
  const existing =
    await repo.findChargebackById({
      tenantId:
        auth.tenantId,
      chargebackId,
    });

  if (!existing) {
    throw httpError(
      404,
      "Chargeback record not found"
    );
  }

  return repo.updateChargeback({
    tenantId:
      auth.tenantId,
    chargebackId,
    body,
  });
};

module.exports = {
  createDispute,
  getDispute,
  listDisputes,
  updateDispute,
  addEvidence,
  reviewEvidence,
  createAndPostRefund,
  createChargeback,
  updateChargeback,
};
