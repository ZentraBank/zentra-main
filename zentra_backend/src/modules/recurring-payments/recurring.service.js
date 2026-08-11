const repo =
  require("./recurring.repository");

const paymentsService =
  require("../payments/payments.service");

const eventsService =
  require("../events/events.service");

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

const addMonths = (
  date,
  months
) => {
  const result =
    new Date(
      `${date}T00:00:00Z`
    );

  result.setUTCMonth(
    result.getUTCMonth() +
    months
  );

  return result
    .toISOString()
    .slice(0, 10);
};

const addDays = (
  date,
  days
) => {
  const result =
    new Date(
      `${date}T00:00:00Z`
    );

  result.setUTCDate(
    result.getUTCDate() +
    days
  );

  return result
    .toISOString()
    .slice(0, 10);
};

const calculateNextDate = (
  mandate,
  currentDate
) => {
  switch (
    mandate.frequency
  ) {
    case "daily":
      return addDays(
        currentDate,
        1
      );

    case "weekly":
      return addDays(
        currentDate,
        7
      );

    case "biweekly":
      return addDays(
        currentDate,
        14
      );

    case "monthly":
      return addMonths(
        currentDate,
        1
      );

    case "quarterly":
      return addMonths(
        currentDate,
        3
      );

    case "semiannual":
      return addMonths(
        currentDate,
        6
      );

    case "annual":
      return addMonths(
        currentDate,
        12
      );

    case "custom":
      if (
        mandate.interval_unit ===
        "day"
      ) {
        return addDays(
          currentDate,
          Number(
            mandate.interval_value
          )
        );
      }

      if (
        mandate.interval_unit ===
        "week"
      ) {
        return addDays(
          currentDate,
          Number(
            mandate.interval_value
          ) * 7
        );
      }

      return addMonths(
        currentDate,
        Number(
          mandate.interval_value
        )
      );

    default:
      throw httpError(
        422,
        "Unsupported mandate frequency"
      );
  }
};

const createMandate = async ({
  auth,
  body,
}) => {
  if (
    body.fixedAmount ===
      undefined &&
    body.maximumAmount ===
      undefined
  ) {
    throw httpError(
      422,
      "A fixed amount or maximum amount is required"
    );
  }

  if (
    body.frequency ===
      "custom" &&
    (
      !body.intervalValue ||
      !body.intervalUnit
    )
  ) {
    throw httpError(
      422,
      "Custom frequency requires an interval value and unit"
    );
  }

  const mandate =
    await repo.createMandate({
      tenantId:
        auth.tenantId,
      userId:
        auth.userId,
      body,
    });

  await repo.addMandateEvent({
    tenantId:
      auth.tenantId,
    mandateId:
      mandate.id,
    eventType:
      "mandate_created",
    actorUserId:
      auth.userId,
    actorType:
      "customer",
    previousStatus: null,
    newStatus:
      mandate.status,
  });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "mandate.created",
    aggregateType:
      "payment_mandate",
    aggregateId:
      mandate.id,
    idempotencyKey:
      `mandate:${mandate.id}:created:v1`,
    payload: {
      mandateId:
        mandate.id,
      reference:
        mandate.mandate_reference,
      mandateType:
        mandate.mandate_type,
      frequency:
        mandate.frequency,
      currency:
        mandate.currency,
    },
  });

  return mandate;
};

const createAuthorisation = async ({
  auth,
  mandateId,
  body,
}) => {
  const mandate =
    await repo.findMandateById({
      tenantId:
        auth.tenantId,
      mandateId,
    });

  if (!mandate) {
    throw httpError(
      404,
      "Payment mandate not found"
    );
  }

  if (
    mandate.status !==
    "pending_activation"
  ) {
    throw httpError(
      409,
      "Only pending mandates can be authorised"
    );
  }

  return repo.createAuthorisation({
    tenantId:
      auth.tenantId,
    mandateId,
    body,
  });
};

const confirmAuthorisation = async ({
  auth,
  authorisationId,
}) => {
  const authorisation =
    await repo.findAuthorisationById({
      tenantId:
        auth.tenantId,
      authorisationId,
    });

  if (!authorisation) {
    throw httpError(
      404,
      "Mandate authorisation not found"
    );
  }

  if (
    authorisation.status !==
    "pending"
  ) {
    throw httpError(
      409,
      "Authorisation has already been processed"
    );
  }

  const confirmed =
    await repo.confirmAuthorisation({
      tenantId:
        auth.tenantId,
      authorisationId,
      authorisedBy:
        auth.userId,
    });

  const mandate =
    await repo.updateMandateStatus({
      tenantId:
        auth.tenantId,
      mandateId:
        confirmed.payment_mandate_id,
      newStatus: "active",
      actorUserId:
        auth.userId,
      actorType: "customer",
      note:
        "Mandate authorisation confirmed",
    });

  const amount =
    Number(
      mandate.fixed_amount ||
      mandate.maximum_amount
    );

  await repo.createSchedule({
    tenantId:
      auth.tenantId,
    mandate,
    scheduledDate:
      String(
        mandate.next_collection_date
      ).slice(0, 10),
    amount,
  });

  return {
    authorisation:
      confirmed,
    mandate,
  };
};

const changeMandateStatus = async ({
  auth,
  mandateId,
  body,
}) => {
  const mandate =
    await repo.findMandateById({
      tenantId:
        auth.tenantId,
      mandateId,
    });

  if (!mandate) {
    throw httpError(
      404,
      "Payment mandate not found"
    );
  }

  const transitions = {
    active: [
      "paused",
      "cancelled",
    ],
    paused: [
      "active",
      "cancelled",
    ],
    pending_activation: [
      "cancelled",
    ],
  };

  if (
    !(
      transitions[
        mandate.status
      ] || []
    ).includes(
      body.status
    )
  ) {
    throw httpError(
      409,
      `Cannot change mandate from ${mandate.status} to ${body.status}`
    );
  }

  return repo.updateMandateStatus({
    tenantId:
      auth.tenantId,
    mandateId,
    newStatus:
      body.status,
    actorUserId:
      auth.userId,
    actorType:
      body.actorType ||
      "customer",
    note:
      body.reason,
  });
};

const executeSchedule = async ({
  tenantId,
  schedule,
}) => {
  await repo.markScheduleProcessing({
    tenantId,
    scheduleId:
      schedule.id,
  });

  const auth = {
    tenantId,
    userId:
      schedule.user_id,
  };

  try {
    const result =
      await paymentsService
        .createInstruction({
          auth,
          body: {
            railId:
              schedule
                .payment_rail_id,

            sourceAccountId:
              schedule
                .source_account_id,

            sourceLedgerAccountId:
              schedule
                .source_ledger_account_id,

            destinationAccountId:
              schedule
                .destination_account_id,

            destinationLedgerAccountId:
              schedule
                .destination_ledger_account_id,

            idempotencyKey:
              schedule.idempotency_key,

            direction:
              "outbound",

            paymentType:
              "debit_transfer",

            amount:
              schedule.amount,

            feeAmount: 0,

            currency:
              schedule.currency,

            creditorName:
              schedule
                .creditor_name,

            creditorAccountReference:
              schedule
                .creditor_reference ||
              schedule
                .destination_account_id,

            narration:
              `Recurring payment under mandate ${schedule.payment_mandate_id}`,

            requestedExecutionDate:
              schedule.scheduled_date,

            metadata: {
              mandateId:
                schedule
                  .payment_mandate_id,

              recurringScheduleId:
                schedule.id,
            },
          },
        });

    const instruction =
      result.instruction;

    await repo.markScheduleSucceeded({
      tenantId,
      scheduleId:
        schedule.id,
      paymentInstructionId:
        instruction.id,
      ledgerJournalId:
        instruction
          .ledger_journal_id ||
        null,
    });

    const mandate =
      await repo.findMandateById({
        tenantId,
        mandateId:
          schedule
            .payment_mandate_id,
      });

    const executedDate =
      String(
        schedule.scheduled_date
      ).slice(0, 10);

    const nextDate =
      calculateNextDate(
        mandate,
        executedDate
      );

    const completed =
      Boolean(
        mandate.end_date &&
        nextDate >
          String(
            mandate.end_date
          ).slice(0, 10)
      );

    await repo
      .updateMandateAfterExecution({
        tenantId,
        mandateId:
          mandate.id,
        executedDate,
        nextCollectionDate:
          completed
            ? null
            : nextDate,
        completed,
      });

    if (!completed) {
      await repo.createSchedule({
        tenantId,
        mandate,
        scheduledDate:
          nextDate,
        amount:
          Number(
            mandate.fixed_amount ||
            mandate.maximum_amount
          ),
      });
    }

    await eventsService.emit({
      tenantId,
      eventType:
        "recurring_payment.succeeded",
      aggregateType:
        "recurring_payment_schedule",
      aggregateId:
        schedule.id,
      idempotencyKey:
        `recurring:${schedule.id}:succeeded:v1`,
      payload: {
        scheduleId:
          schedule.id,
        mandateId:
          mandate.id,
        paymentInstructionId:
          instruction.id,
        amount:
          schedule.amount,
        currency:
          schedule.currency,
      },
    });

    return {
      success: true,
      instruction,
    };
  } catch (error) {
    const attempt =
      Number(
        schedule.attempt_count
      ) + 1;

    const mayRetry =
      schedule
        .insufficient_funds_policy ===
        "retry" &&
      attempt <=
        Number(
          schedule.retry_count
        );

    const retryAt =
      mayRetry
        ? new Date(
            Date.now() +
            Number(
              schedule
                .retry_interval_hours
            ) *
              60 *
              60 *
              1000
          )
        : null;

    await repo.markScheduleFailed({
      tenantId,
      scheduleId:
        schedule.id,
      failureCode:
        error.code ||
        "EXECUTION_FAILED",
      failureMessage:
        error.message,
      retryAt,
    });

    await eventsService.emit({
      tenantId,
      eventType:
        mayRetry
          ? "recurring_payment.retry_scheduled"
          : "recurring_payment.failed",
      aggregateType:
        "recurring_payment_schedule",
      aggregateId:
        schedule.id,
      idempotencyKey:
        `recurring:${schedule.id}:failure:${attempt}`,
      payload: {
        scheduleId:
          schedule.id,
        mandateId:
          schedule
            .payment_mandate_id,
        attempt,
        retryAt,
        error:
          error.message,
      },
    });

    return {
      success: false,
      retryAt,
      error:
        error.message,
    };
  }
};

const executeDueSchedules = async ({
  tenantId,
  limit = 100,
}) => {
  const schedules =
    await repo.findDueSchedules({
      tenantId,
      limit,
    });

  const results = [];

  for (
    const schedule
    of schedules
  ) {
    results.push(
      await executeSchedule({
        tenantId,
        schedule,
      })
    );
  }

  return {
    processed:
      schedules.length,
    results,
  };
};

const listMandates = ({
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

  return repo.listMandates({
    tenantId:
      auth.tenantId,
    userId:
      mine
        ? auth.userId
        : query.userId ||
          null,
    status:
      query.status ||
      null,
    mandateType:
      query.mandateType ||
      null,
    limit,
    offset:
      (page - 1) *
      limit,
  });
};

module.exports = {
  createMandate,
  createAuthorisation,
  confirmAuthorisation,
  changeMandateStatus,
  executeSchedule,
  executeDueSchedules,
  listMandates,
};
