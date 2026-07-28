const repo =
  require("./payments.repository");

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

const validateAmountAgainstRail = (
  rail,
  amount
) => {
  const numeric =
    Number(amount);

  if (
    rail.minimum_amount !== null &&
    numeric <
      Number(
        rail.minimum_amount
      )
  ) {
    throw httpError(
      422,
      "Payment amount is below the rail minimum"
    );
  }

  if (
    rail.maximum_amount !== null &&
    numeric >
      Number(
        rail.maximum_amount
      )
  ) {
    throw httpError(
      422,
      "Payment amount exceeds the rail maximum"
    );
  }
};

const createInstruction = async ({
  auth,
  body,
}) => {
  const existing =
    await repo
      .findInstructionByIdempotency({
        tenantId:
          auth.tenantId,
        idempotencyKey:
          body.idempotencyKey,
      });

  if (existing) {
    return {
      idempotent: true,
      instruction: existing,
    };
  }

  const rail =
    await repo.findRailById({
      tenantId:
        auth.tenantId,
      railId:
        body.railId,
    });

  if (!rail) {
    throw httpError(
      404,
      "Payment rail not found"
    );
  }

  if (
    rail.status !== "active"
  ) {
    throw httpError(
      409,
      "Payment rail is not active"
    );
  }

  if (
    rail.currency !==
    body.currency
  ) {
    throw httpError(
      422,
      "Payment currency does not match the rail"
    );
  }

  validateAmountAgainstRail(
    rail,
    body.amount
  );

  const instruction =
    await repo.createInstruction({
      tenantId:
        auth.tenantId,
      userId:
        auth.userId,
      body,
    });

  await repo.addStatusEvent({
    tenantId:
      auth.tenantId,
    instructionId:
      instruction.id,
    previousStatus: null,
    newStatus: "created",
    actorUserId:
      auth.userId,
    actorType: "customer",
    note:
      "Payment instruction created",
  });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "payment.created",
    aggregateType:
      "payment_instruction",
    aggregateId:
      instruction.id,
    idempotencyKey:
      `payment:${instruction.id}:created:v1`,
    payload: {
      paymentId:
        instruction.id,
      reference:
        instruction.payment_reference,
      amount:
        instruction.amount,
      currency:
        instruction.currency,
      direction:
        instruction.direction,
    },
  });

  return {
    idempotent: false,
    instruction,
  };
};

const validateInstruction = async ({
  auth,
  instructionId,
}) => {
  const instruction =
    await repo.findInstructionById({
      tenantId:
        auth.tenantId,
      instructionId,
    });

  if (!instruction) {
    throw httpError(
      404,
      "Payment instruction not found"
    );
  }

  if (
    instruction.status !==
    "created"
  ) {
    throw httpError(
      409,
      "Only created instructions can be validated"
    );
  }

  return repo.updateInstructionStatus({
    tenantId:
      auth.tenantId,
    instructionId,
    newStatus:
      "validated",
    fields: {
      actorUserId:
        auth.userId,
      actorType:
        "staff",
      note:
        "Payment instruction validated",
    },
  });
};

const submitInstruction = async ({
  auth,
  instructionId,
  body,
}) => {
  const instruction =
    await repo.findInstructionById({
      tenantId:
        auth.tenantId,
      instructionId,
    });

  if (!instruction) {
    throw httpError(
      404,
      "Payment instruction not found"
    );
  }

  if (
    ![
      "validated",
      "queued",
      "accepted",
    ].includes(
      instruction.status
    )
  ) {
    throw httpError(
      409,
      "Payment is not ready for submission"
    );
  }

  const updated =
    await repo.updateInstructionStatus({
      tenantId:
        auth.tenantId,
      instructionId,
      newStatus:
        body.status ||
        "submitted",
      fields: {
        externalReference:
          body.externalReference,
        actorUserId:
          auth.userId,
        actorType:
          "staff",
        note:
          body.note,
      },
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      `payment.${updated.status}`,
    aggregateType:
      "payment_instruction",
    aggregateId:
      updated.id,
    idempotencyKey:
      `payment:${updated.id}:${updated.status}:v1`,
    payload: {
      paymentId:
        updated.id,
      reference:
        updated.payment_reference,
      externalReference:
        updated.external_reference,
      status:
        updated.status,
    },
  });

  return updated;
};

const markCleared = async ({
  auth,
  instructionId,
  body,
}) => {
  const instruction =
    await repo.findInstructionById({
      tenantId:
        auth.tenantId,
      instructionId,
    });

  if (!instruction) {
    throw httpError(
      404,
      "Payment instruction not found"
    );
  }

  if (
    ![
      "submitted",
      "accepted",
      "queued",
    ].includes(
      instruction.status
    )
  ) {
    throw httpError(
      409,
      "Payment cannot be marked cleared from its current status"
    );
  }

  return repo.updateInstructionStatus({
    tenantId:
      auth.tenantId,
    instructionId,
    newStatus:
      "cleared",
    fields: {
      clearingBatchId:
        body.clearingBatchId,
      actorUserId:
        auth.userId,
      actorType:
        body.actorType ||
        "external_network",
      note:
        body.note ||
        "Payment cleared",
    },
  });
};

const createClearingBatch = async ({
  auth,
  body,
}) => {
  const rail =
    await repo.findRailById({
      tenantId:
        auth.tenantId,
      railId:
        body.railId,
    });

  if (!rail) {
    throw httpError(
      404,
      "Payment rail not found"
    );
  }

  if (
    rail.currency !==
    body.currency
  ) {
    throw httpError(
      422,
      "Batch currency does not match the rail"
    );
  }

  return repo.createClearingBatch({
    tenantId:
      auth.tenantId,
    railId:
      body.railId,
    body,
  });
};

const addInstructionToBatch = async ({
  auth,
  batchId,
  instructionId,
}) => {
  const batch =
    await repo.findClearingBatchById({
      tenantId:
        auth.tenantId,
      batchId,
    });

  if (!batch) {
    throw httpError(
      404,
      "Clearing batch not found"
    );
  }

  if (
    batch.status !==
    "open"
  ) {
    throw httpError(
      409,
      "Clearing batch is not open"
    );
  }

  return repo.addInstructionToBatch({
    tenantId:
      auth.tenantId,
    batchId,
    instructionId,
  });
};

const calculateSettlement = async ({
  auth,
  body,
}) => {
  const rail =
    await repo.findRailById({
      tenantId:
        auth.tenantId,
      railId:
        body.railId,
    });

  if (!rail) {
    throw httpError(
      404,
      "Payment rail not found"
    );
  }

  const totals =
    await repo.aggregateForSettlement({
      tenantId:
        auth.tenantId,
      railId:
        body.railId,
      settlementDate:
        body.settlementDate,
      currency:
        body.currency,
    });

  return repo.createSettlementBatch({
    tenantId:
      auth.tenantId,
    railId:
      body.railId,
    body,
    totals,
  });
};

const postSettlement = async ({
  auth,
  settlementBatchId,
}) => {
  const batch =
    await repo.findSettlementBatchById({
      tenantId:
        auth.tenantId,
      settlementBatchId,
    });

  if (!batch) {
    throw httpError(
      404,
      "Settlement batch not found"
    );
  }

  if (
    ![
      "calculated",
      "approved",
    ].includes(
      batch.status
    )
  ) {
    throw httpError(
      409,
      "Settlement batch is not ready for posting"
    );
  }

  const rail =
    await repo.findRailById({
      tenantId:
        auth.tenantId,
      railId:
        batch.rail_id,
    });

  const net =
    Number(
      batch.net_settlement_amount
    );

  if (net === 0) {
    throw httpError(
      422,
      "A zero-net settlement does not require a journal"
    );
  }

  const entries =
    net > 0
      ? [
          {
            ledgerAccountId:
              rail.clearing_ledger_account_id,
            entryType:
              "debit",
            amount:
              Math.abs(net),
            currency:
              batch.currency,
          },
          {
            ledgerAccountId:
              rail.settlement_ledger_account_id,
            entryType:
              "credit",
            amount:
              Math.abs(net),
            currency:
              batch.currency,
          },
        ]
      : [
          {
            ledgerAccountId:
              rail.settlement_ledger_account_id,
            entryType:
              "debit",
            amount:
              Math.abs(net),
            currency:
              batch.currency,
          },
          {
            ledgerAccountId:
              rail.clearing_ledger_account_id,
            entryType:
              "credit",
            amount:
              Math.abs(net),
            currency:
              batch.currency,
          },
        ];

  const result =
    await ledgerService.postJournal({
      auth,
      body: {
        reference:
          batch.settlement_reference,
        idempotencyKey:
          `settlement:${batch.id}:post`,
        transactionType:
          "payment_settlement",
        description:
          `Settlement for ${batch.settlement_reference}`,
        sourceType:
          "settlement_batch",
        sourceId:
          batch.id,
        entries,
      },
    });

  const posted =
    await repo.markSettlementPosted({
      tenantId:
        auth.tenantId,
      settlementBatchId:
        batch.id,
      journalId:
        result.journal.id,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "settlement.posted",
    aggregateType:
      "settlement_batch",
    aggregateId:
      posted.id,
    idempotencyKey:
      `settlement:${posted.id}:posted:v1`,
    payload: {
      settlementBatchId:
        posted.id,
      reference:
        posted.settlement_reference,
      netSettlementAmount:
        posted.net_settlement_amount,
      currency:
        posted.currency,
      journalId:
        posted.ledger_journal_id,
    },
  });

  return posted;
};

const listInstructions = ({
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

  return repo.listInstructions({
    tenantId:
      auth.tenantId,
    userId:
      mine
        ? auth.userId
        : query.userId || null,
    status:
      query.status || null,
    railId:
      query.railId || null,
    limit,
    offset:
      (page - 1) *
      limit,
  });
};

module.exports = {
  createInstruction,
  validateInstruction,
  submitInstruction,
  markCleared,
  createClearingBatch,
  addInstructionToBatch,
  calculateSettlement,
  postSettlement,
  listInstructions,
  createRail:
    ({ auth, body }) =>
      repo.createRail({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),
  listRails:
    ({ auth, query }) =>
      repo.listRails({
        tenantId:
          auth.tenantId,
        status:
          query.status || null,
        railType:
          query.railType || null,
      }),
};
