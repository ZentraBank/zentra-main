const crypto =
  require("crypto");

const repo =
  require("./virtual-accounts.repository");

const ledgerService =
  require("../ledger/ledger.service");

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

const generateAccountNumber = (
  prefix,
  length
) => {
  const safePrefix =
    prefix || "";

  const remaining =
    Number(length) -
    safePrefix.length;

  if (remaining < 4) {
    throw httpError(
      422,
      "Account number length is too short for the configured prefix"
    );
  }

  const max =
    10 ** remaining;

  const random =
    crypto.randomInt(
      0,
      max
    )
      .toString()
      .padStart(
        remaining,
        "0"
      );

  return `${safePrefix}${random}`;
};

const allocateUniqueAccountNumber =
  async ({
    tenantId,
    program,
  }) => {
    for (
      let attempt = 0;
      attempt < 20;
      attempt += 1
    ) {
      const candidate =
        generateAccountNumber(
          program.account_number_prefix,
          program.account_number_length
        );

      const existing =
        await repo
          .findVirtualAccountByAccountNumber({
            tenantId,
            accountNumber:
              candidate,
          });

      if (!existing) {
        return candidate;
      }
    }

    throw httpError(
      503,
      "Unable to allocate a unique virtual account number"
    );
  };

const createVirtualAccount = async ({
  auth,
  body,
}) => {
  const program =
    await repo.findProgramById({
      tenantId:
        auth.tenantId,
      programId:
        body.programId,
    });

  if (!program) {
    throw httpError(
      404,
      "Virtual account program not found"
    );
  }

  if (
    program.status !==
    "active"
  ) {
    throw httpError(
      409,
      "Virtual account program is not active"
    );
  }

  if (
    program.currency !==
    body.currency
  ) {
    throw httpError(
      422,
      "Virtual account currency does not match the program"
    );
  }

  const accountNumber =
    body.externalAccountNumber ||
    await allocateUniqueAccountNumber({
      tenantId:
        auth.tenantId,
      program,
    });

  const virtualAccount =
    await repo.createVirtualAccount({
      tenantId:
        auth.tenantId,
      ownerUserId:
        body.ownerUserId ||
        auth.userId,
      body,
      accountNumber,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "virtual_account.created",
    aggregateType:
      "virtual_account",
    aggregateId:
      virtualAccount.id,
    idempotencyKey:
      `virtual-account:${virtualAccount.id}:created:v1`,
    payload: {
      virtualAccountId:
        virtualAccount.id,
      accountNumber:
        virtualAccount.account_number,
      masterAccountId:
        virtualAccount.master_account_id,
      currency:
        virtualAccount.currency,
    },
  });

  return virtualAccount;
};

const matchCollection = async ({
  tenantId,
  body,
}) => {
  if (
    body.virtualAccountNumber
  ) {
    const account =
      await repo
        .findVirtualAccountByAccountNumber({
          tenantId,
          accountNumber:
            body.virtualAccountNumber,
        });

    if (
      account &&
      account.status ===
      "active"
    ) {
      return {
        virtualAccountId:
          account.id,
        matchMethod:
          "account_number",
        confidenceScore: 100,
        virtualAccount:
          account,
      };
    }
  }

  if (
    body.paymentReference
  ) {
    const account =
      await repo
        .findVirtualAccountByReference({
          tenantId,
          reference:
            body.paymentReference,
        });

    if (
      account &&
      account.status ===
      "active"
    ) {
      return {
        virtualAccountId:
          account.id,
        matchMethod:
          "exact_reference",
        confidenceScore: 95,
        virtualAccount:
          account,
      };
    }
  }

  if (
    body.payerReference
  ) {
    const account =
      await repo
        .findVirtualAccountByReference({
          tenantId,
          reference:
            body.payerReference,
        });

    if (
      account &&
      account.status ===
      "active"
    ) {
      return {
        virtualAccountId:
          account.id,
        matchMethod:
          "payer_reference",
        confidenceScore: 90,
        virtualAccount:
          account,
      };
    }
  }

  return {
    virtualAccountId:
      null,
    matchMethod:
      "unmatched",
    confidenceScore:
      null,
    virtualAccount:
      null,
  };
};

const validateCollectionAgainstAccount =
  ({
    body,
    virtualAccount,
  }) => {
    if (!virtualAccount) {
      return;
    }

    if (
      virtualAccount.currency !==
      body.currency
    ) {
      throw httpError(
        422,
        "Collection currency does not match the virtual account"
      );
    }

    if (
      virtualAccount.expiry_at &&
      new Date(
        virtualAccount.expiry_at
      ).getTime() <=
      Date.now()
    ) {
      throw httpError(
        409,
        "Virtual account has expired"
      );
    }

    if (
      virtualAccount.fixed_amount !==
        null &&
      Number(body.amount) !==
        Number(
          virtualAccount.fixed_amount
        )
    ) {
      throw httpError(
        422,
        "Collection amount does not match the virtual account fixed amount"
      );
    }

    if (
      virtualAccount.maximum_amount !==
        null &&
      Number(body.amount) >
        Number(
          virtualAccount.maximum_amount
        )
    ) {
      throw httpError(
        422,
        "Collection amount exceeds the virtual account maximum"
      );
    }
  };

const ingestCollection = async ({
  auth,
  body,
}) => {
  const existing =
    await repo
      .findCollectionByIdempotency({
        tenantId:
          auth.tenantId,
        idempotencyKey:
          body.idempotencyKey,
      });

  if (existing) {
    return {
      idempotent: true,
      collection:
        existing,
    };
  }

  const program =
    await repo.findProgramById({
      tenantId:
        auth.tenantId,
      programId:
        body.programId,
    });

  if (!program) {
    throw httpError(
      404,
      "Virtual account program not found"
    );
  }

  if (
    program.currency !==
    body.currency
  ) {
    throw httpError(
      422,
      "Collection currency does not match the program"
    );
  }

  const match =
    await matchCollection({
      tenantId:
        auth.tenantId,
      body,
    });

  validateCollectionAgainstAccount({
    body,
    virtualAccount:
      match.virtualAccount,
  });

  const collection =
    await repo.createCollection({
      tenantId:
        auth.tenantId,
      body,
      match,
    });

  if (!match.virtualAccount) {
    await eventsService.emit({
      tenantId:
        auth.tenantId,
      eventType:
        "collection.unmatched",
      aggregateType:
        "collection_transaction",
      aggregateId:
        collection.id,
      idempotencyKey:
        `collection:${collection.id}:unmatched:v1`,
      payload: {
        collectionId:
          collection.id,
        externalReference:
          collection.external_reference,
        amount:
          collection.amount,
        currency:
          collection.currency,
      },
    });

    return {
      idempotent: false,
      collection,
    };
  }

  const entries = [
    {
      ledgerAccountId:
        program.collection_clearing_ledger_account_id,
      entryType:
        "debit",
      amount:
        collection.net_amount,
      currency:
        collection.currency,
    },
    {
      ledgerAccountId:
        match.virtualAccount
          .master_ledger_account_id,
      entryType:
        "credit",
      amount:
        collection.net_amount,
      currency:
        collection.currency,
    },
  ];

  if (
    Number(
      collection.fee_amount
    ) > 0 &&
    program.fee_ledger_account_id
  ) {
    entries.push(
      {
        ledgerAccountId:
          program.collection_clearing_ledger_account_id,
        entryType:
          "debit",
        amount:
          collection.fee_amount,
        currency:
          collection.currency,
      },
      {
        ledgerAccountId:
          program.fee_ledger_account_id,
        entryType:
          "credit",
        amount:
          collection.fee_amount,
        currency:
          collection.currency,
      }
    );
  }

  const journal =
    await ledgerService.postJournal({
      auth,
      body: {
        reference:
          collection.collection_reference,
        idempotencyKey:
          `collection:${collection.id}:post`,
        transactionType:
          "virtual_account_collection",
        description:
          `Collection for virtual account ${match.virtualAccount.account_number}`,
        sourceType:
          "collection_transaction",
        sourceId:
          collection.id,
        entries,
      },
    });

  const posted =
    await repo.markCollectionPosted({
      tenantId:
        auth.tenantId,
      collectionId:
        collection.id,
      journalId:
        journal.journal.id,
    });

  await eventsService.emit({
    tenantId:
      auth.tenantId,
    eventType:
      "collection.posted",
    aggregateType:
      "collection_transaction",
    aggregateId:
      posted.id,
    idempotencyKey:
      `collection:${posted.id}:posted:v1`,
    payload: {
      collectionId:
        posted.id,
      virtualAccountId:
        posted.virtual_account_id,
      amount:
        posted.net_amount,
      currency:
        posted.currency,
      journalId:
        posted.ledger_journal_id,
    },
  });

  return {
    idempotent: false,
    collection: posted,
  };
};

const manualMatchCollection = async ({
  auth,
  collectionId,
  body,
}) => {
  const collection =
    await repo.findCollectionById({
      tenantId:
        auth.tenantId,
      collectionId,
    });

  if (!collection) {
    throw httpError(
      404,
      "Collection transaction not found"
    );
  }

  const virtualAccount =
    await repo.findVirtualAccountById({
      tenantId:
        auth.tenantId,
      virtualAccountId:
        body.virtualAccountId,
    });

  if (!virtualAccount) {
    throw httpError(
      404,
      "Virtual account not found"
    );
  }

  validateCollectionAgainstAccount({
    body: {
      amount:
        collection.amount,
      currency:
        collection.currency,
    },
    virtualAccount,
  });

  return repo.manualMatchCollection({
    tenantId:
      auth.tenantId,
    collectionId,
    virtualAccountId:
      virtualAccount.id,
  });
};

const listVirtualAccounts = ({
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

  return repo.listVirtualAccounts({
    tenantId:
      auth.tenantId,
    ownerUserId:
      mine
        ? auth.userId
        : query.ownerUserId ||
          null,
    programId:
      query.programId ||
      null,
    status:
      query.status ||
      null,
    limit,
    offset:
      (page - 1) *
      limit,
  });
};

module.exports = {
  createVirtualAccount,
  ingestCollection,
  manualMatchCollection,
  listVirtualAccounts,

  createProgram:
    ({ auth, body }) =>
      repo.createProgram({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),

  createSweepRule:
    ({ auth, body }) =>
      repo.createSweepRule({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),
};
