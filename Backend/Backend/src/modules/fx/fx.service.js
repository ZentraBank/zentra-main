const repo =
  require("./fx.repository");

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

const roundMoney = (
  value
) =>
  Number(
    Number(value).toFixed(2)
  );

const calculateSpread = ({
  sourceAmount,
  marketRate,
  spreadRule,
}) => {
  if (!spreadRule) {
    return {
      customerRate:
        Number(marketRate),
      spreadAmount: 0,
      feeAmount: 0,
    };
  }

  let customerRate =
    Number(marketRate);

  let feeAmount = 0;

  if (
    spreadRule.spread_type ===
    "basis_points"
  ) {
    customerRate =
      customerRate *
      (
        1 -
        Number(
          spreadRule.spread_value
        ) /
        10000
      );
  }

  if (
    spreadRule.spread_type ===
    "percentage"
  ) {
    customerRate =
      customerRate *
      (
        1 -
        Number(
          spreadRule.spread_value
        ) /
        100
      );
  }

  if (
    spreadRule.spread_type ===
    "fixed"
  ) {
    feeAmount =
      Number(
        spreadRule.spread_value
      );
  }

  if (
    spreadRule.minimum_fee !==
      null &&
    feeAmount <
      Number(
        spreadRule.minimum_fee
      )
  ) {
    feeAmount =
      Number(
        spreadRule.minimum_fee
      );
  }

  if (
    spreadRule.maximum_fee !==
      null &&
    feeAmount >
      Number(
        spreadRule.maximum_fee
      )
  ) {
    feeAmount =
      Number(
        spreadRule.maximum_fee
      );
  }

  const marketAmount =
    Number(sourceAmount) *
    Number(marketRate);

  const customerAmount =
    Number(sourceAmount) *
    customerRate;

  return {
    customerRate:
      Number(
        customerRate.toFixed(10)
      ),

    spreadAmount:
      roundMoney(
        marketAmount -
        customerAmount
      ),

    feeAmount:
      roundMoney(
        feeAmount
      ),
  };
};

const createQuote = async ({
  auth,
  body,
}) => {
  const existing =
    await repo
      .findQuoteByIdempotency({
        tenantId:
          auth.tenantId,

        idempotencyKey:
          body.idempotencyKey,
      });

  if (existing) {
    return {
      idempotent: true,
      quote: existing,
    };
  }

  let rate =
    await repo.findBestRate({
      tenantId:
        auth.tenantId,

      baseCurrency:
        body.sourceCurrency,

      quoteCurrency:
        body.destinationCurrency,
    });

  let inverse = false;

  if (!rate) {
    rate =
      await repo.findBestRate({
        tenantId:
          auth.tenantId,

        baseCurrency:
          body.destinationCurrency,

        quoteCurrency:
          body.sourceCurrency,
      });

    inverse = Boolean(rate);
  }

  if (!rate) {
    throw httpError(
      404,
      "No active FX rate is available for this currency pair"
    );
  }

  const marketRate =
    inverse
      ? 1 /
        Number(rate.ask_rate)
      : Number(
          rate.bid_rate
        );

  const spreadRule =
    await repo
      .findApplicableSpreadRule({
        tenantId:
          auth.tenantId,

        sourceCurrency:
          body.sourceCurrency,

        destinationCurrency:
          body.destinationCurrency,

        customerSegment:
          body.customerSegment,

        transactionType:
          body.transactionType,
      });

  const spread =
    calculateSpread({
      sourceAmount:
        body.sourceAmount,

      marketRate,

      spreadRule,
    });

  const destinationAmount =
    roundMoney(
      Number(
        body.sourceAmount
      ) *
      spread.customerRate -
      spread.feeAmount
    );

  if (
    destinationAmount <= 0
  ) {
    throw httpError(
      422,
      "FX quote results in a non-positive destination amount"
    );
  }

  const expiresAt =
    new Date(
      Date.now() +
      Number(
        body.validForSeconds
      ) *
      1000
    );

  const quote =
    await repo.createQuote({
      tenantId:
        auth.tenantId,

      userId:
        auth.userId,

      body,

      calculation: {
        destinationAmount,
        marketRate:
          Number(
            marketRate.toFixed(10)
          ),
        customerRate:
          spread.customerRate,
        spreadAmount:
          spread.spreadAmount,
        feeAmount:
          spread.feeAmount,
        rateSourceId:
          rate.rate_source_id,
        spreadRuleId:
          spreadRule?.id ||
          null,
        expiresAt,
      },
    });

  return {
    idempotent: false,
    quote,
  };
};

const executeConversion = async ({
  auth,
  quoteId,
  body,
}) => {
  const quote =
    await repo.findQuoteById({
      tenantId:
        auth.tenantId,
      quoteId,
    });

  if (!quote) {
    throw httpError(
      404,
      "FX quote not found"
    );
  }

  if (
    quote.status ===
    "accepted"
  ) {
    throw httpError(
      409,
      "FX quote has already been used"
    );
  }

  if (
    quote.status !==
      "active" ||
    new Date(
      quote.expires_at
    ).getTime() <=
      Date.now()
  ) {
    throw httpError(
      409,
      "FX quote has expired"
    );
  }

  const accepted =
    await repo.acceptQuote({
      tenantId:
        auth.tenantId,
      quoteId,
    });

  if (
    accepted.status !==
    "accepted"
  ) {
    throw httpError(
      409,
      "FX quote could not be accepted"
    );
  }

  const conversion =
    await repo.createConversion({
      tenantId:
        auth.tenantId,
      userId:
        auth.userId,
      quote: accepted,
      body,
    });

  const entries = [
    {
      ledgerAccountId:
        body.sourceLedgerAccountId,
      entryType: "debit",
      amount:
        accepted.source_amount,
      currency:
        accepted.source_currency,
    },
    {
      ledgerAccountId:
        body.fxPositionLedgerAccountId,
      entryType: "credit",
      amount:
        accepted.source_amount,
      currency:
        accepted.source_currency,
    },
    {
      ledgerAccountId:
        body.fxPositionLedgerAccountId,
      entryType: "debit",
      amount:
        accepted.destination_amount,
      currency:
        accepted.destination_currency,
    },
    {
      ledgerAccountId:
        body.destinationLedgerAccountId,
      entryType: "credit",
      amount:
        accepted.destination_amount,
      currency:
        accepted.destination_currency,
    },
  ];

  if (
    Number(
      accepted.fee_amount
    ) > 0 &&
    body.feeLedgerAccountId
  ) {
    entries.push(
      {
        ledgerAccountId:
          body.sourceLedgerAccountId,
        entryType: "debit",
        amount:
          accepted.fee_amount,
        currency:
          accepted.source_currency,
      },
      {
        ledgerAccountId:
          body.feeLedgerAccountId,
        entryType: "credit",
        amount:
          accepted.fee_amount,
        currency:
          accepted.source_currency,
      }
    );
  }

  const journal =
    await ledgerService.postJournal({
      auth,
      body: {
        reference:
          conversion.conversion_reference,

        idempotencyKey:
          `fx-conversion:${conversion.id}:post`,

        transactionType:
          "fx_conversion",

        description:
          `FX conversion ${accepted.source_currency}/${accepted.destination_currency}`,

        sourceType:
          "fx_conversion",

        sourceId:
          conversion.id,

        entries,
      },
    });

  const posted =
    await repo
      .markConversionPosted({
        tenantId:
          auth.tenantId,

        conversionId:
          conversion.id,

        journalId:
          journal.journal.id,
      });

  await eventsService.emit({
    tenantId:
      auth.tenantId,

    eventType:
      "fx.conversion_posted",

    aggregateType:
      "fx_conversion",

    aggregateId:
      posted.id,

    idempotencyKey:
      `fx:${posted.id}:posted:v1`,

    payload: {
      conversionId:
        posted.id,

      reference:
        posted.conversion_reference,

      sourceAmount:
        posted.source_amount,

      sourceCurrency:
        posted.source_currency,

      destinationAmount:
        posted.destination_amount,

      destinationCurrency:
        posted.destination_currency,

      customerRate:
        posted.customer_rate,

      journalId:
        posted.journal_id,
    },
  });

  return posted;
};

module.exports = {
  createQuote,
  executeConversion,

  createRateSource:
    ({ auth, body }) =>
      repo.createRateSource({
        tenantId:
          auth.tenantId,
        body,
      }),

  createRate:
    async ({ auth, body }) => {
      const source =
        await repo
          .findRateSourceById({
            tenantId:
              auth.tenantId,

            sourceId:
              body.rateSourceId,
          });

      if (!source) {
        throw httpError(
          404,
          "FX rate source not found"
        );
      }

      if (
        Number(body.bidRate) >
        Number(body.askRate)
      ) {
        throw httpError(
          422,
          "Bid rate cannot exceed ask rate"
        );
      }

      return repo.createRate({
        tenantId:
          auth.tenantId,
        body,
      });
    },

  createSpreadRule:
    ({ auth, body }) =>
      repo.createSpreadRule({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),
};
