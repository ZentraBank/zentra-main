const repo =
  require("./treasury.repository");

const ledgerService =
  require("../ledger/ledger.service");

const httpError = (
  statusCode,
  message
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseJson = (value) => {
  if (!value) return [];
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const calculateTieredFee = (
  tiers,
  baseAmount
) => {
  for (const tier of tiers) {
    const minimum =
      Number(tier.minimum || 0);

    const maximum =
      tier.maximum === null ||
      tier.maximum === undefined
        ? Infinity
        : Number(tier.maximum);

    if (
      baseAmount >= minimum &&
      baseAmount <= maximum
    ) {
      if (
        tier.type === "percentage"
      ) {
        return (
          baseAmount *
          Number(tier.rate || 0) /
          100
        );
      }

      return Number(
        tier.amount || 0
      );
    }
  }

  return 0;
};

const calculateFee = (
  definition,
  baseAmount
) => {
  let fee = 0;

  if (
    definition.calculation_type ===
    "fixed"
  ) {
    fee = Number(
      definition.fixed_amount || 0
    );
  }

  if (
    definition.calculation_type ===
    "percentage"
  ) {
    fee =
      baseAmount *
      Number(
        definition.percentage_rate || 0
      ) /
      100;
  }

  if (
    definition.calculation_type ===
    "tiered"
  ) {
    fee =
      calculateTieredFee(
        parseJson(definition.tiers),
        baseAmount
      );
  }

  if (
    definition.minimum_fee !== null
  ) {
    fee = Math.max(
      fee,
      Number(
        definition.minimum_fee
      )
    );
  }

  if (
    definition.maximum_fee !== null
  ) {
    fee = Math.min(
      fee,
      Number(
        definition.maximum_fee
      )
    );
  }

  return Number(
    fee.toFixed(2)
  );
};

const assessFee = async ({
  auth,
  body,
}) => {
  const existing =
    await repo.findFeeAssessmentByIdempotency({
      tenantId:
        auth.tenantId,

      idempotencyKey:
        body.idempotencyKey,
    });

  if (existing) {
    return {
      idempotent: true,
      assessment: existing,
    };
  }

  const definition =
    await repo.findApplicableFeeDefinition({
      tenantId:
        auth.tenantId,

      eventType:
        body.eventType,

      currency:
        body.currency,
    });

  if (!definition) {
    return {
      feeApplicable: false,
      reason:
        "No active fee definition matched this event",
    };
  }

  const feeAmount =
    calculateFee(
      definition,
      Number(body.baseAmount)
    );

  const taxAmount =
    Number(
      (
        feeAmount *
        Number(
          definition.tax_rate || 0
        ) /
        100
      ).toFixed(2)
    );

  const totalAmount =
    Number(
      (
        feeAmount +
        taxAmount
      ).toFixed(2)
    );

  const assessment =
    await repo.createFeeAssessment({
      tenantId:
        auth.tenantId,

      feeDefinition:
        definition,

      body,

      feeAmount,
      taxAmount,
      totalAmount,
    });

  return {
    idempotent: false,
    feeApplicable: true,
    assessment,
  };
};

const postFee = async ({
  auth,
  assessmentId,
}) => {
  const assessment =
    await repo.findFeeAssessmentById({
      tenantId:
        auth.tenantId,

      assessmentId,
    });

  if (!assessment) {
    throw httpError(
      404,
      "Fee assessment not found"
    );
  }

  if (
    assessment.status !== "pending"
  ) {
    throw httpError(
      409,
      "Only pending fee assessments can be posted"
    );
  }

  const definition =
    await repo.findFeeDefinitionById({
      tenantId:
        auth.tenantId,

      feeDefinitionId:
        assessment.fee_definition_id,
    });

  const entries = [
    {
      ledgerAccountId:
        assessment.customer_ledger_account_id,
      entryType: "debit",
      amount:
        assessment.total_amount,
      currency:
        assessment.currency,
      description:
        `Fee ${assessment.reference}`,
    },
    {
      ledgerAccountId:
        definition.revenue_ledger_account_id,
      entryType: "credit",
      amount:
        assessment.fee_amount,
      currency:
        assessment.currency,
      description:
        `Fee revenue ${assessment.reference}`,
    },
  ];

  if (
    Number(
      assessment.tax_amount
    ) > 0
  ) {
    if (
      !definition.tax_ledger_account_id
    ) {
      throw httpError(
        409,
        "Tax ledger account is required"
      );
    }

    entries.push({
      ledgerAccountId:
        definition.tax_ledger_account_id,
      entryType: "credit",
      amount:
        assessment.tax_amount,
      currency:
        assessment.currency,
      description:
        `Fee tax ${assessment.reference}`,
    });
  }

  const result =
    await ledgerService.postJournal({
      auth,
      body: {
        reference:
          `FEE-${assessment.reference}`,
        idempotencyKey:
          `fee-${assessment.id}-post`,
        transactionType:
          "fee_charge",
        description:
          `Fee assessment ${assessment.reference}`,
        sourceType:
          "fee_assessment",
        sourceId:
          assessment.id,
        entries,
      },
    });

  return repo.markFeePosted({
    tenantId:
      auth.tenantId,

    assessmentId:
      assessment.id,

    journalId:
      result.journal.id,
  });
};

const waiveFee = async ({
  auth,
  assessmentId,
  body,
}) => {
  const assessment =
    await repo.findFeeAssessmentById({
      tenantId:
        auth.tenantId,

      assessmentId,
    });

  if (!assessment) {
    throw httpError(
      404,
      "Fee assessment not found"
    );
  }

  if (
    assessment.status !== "pending"
  ) {
    throw httpError(
      409,
      "Only pending fees can be waived"
    );
  }

  return repo.waiveFee({
    tenantId:
      auth.tenantId,

    assessmentId,

    waivedBy:
      auth.userId,

    reason:
      body.reason,
  });
};

const createInterestProduct = ({
  auth,
  body,
}) =>
  repo.createInterestProduct({
    tenantId:
      auth.tenantId,
    body,
    createdBy:
      auth.userId,
  });

const calculateDayFraction = ({
  convention,
  periodStart,
  periodEnd,
}) => {
  const start =
    new Date(periodStart);

  const end =
    new Date(periodEnd);

  const milliseconds =
    end.getTime() -
    start.getTime();

  const days =
    Math.max(
      1,
      Math.ceil(
        milliseconds /
        (1000 * 60 * 60 * 24)
      )
    );

  if (
    convention === "actual_360"
  ) {
    return days / 360;
  }

  if (
    convention === "30_360"
  ) {
    return days / 360;
  }

  return days / 365;
};

const accrueInterest = async ({
  auth,
  body,
}) => {
  const existing =
    await repo.findAccrualByIdempotency({
      tenantId:
        auth.tenantId,

      idempotencyKey:
        body.idempotencyKey,
    });

  if (existing) {
    return {
      idempotent: true,
      accrual: existing,
    };
  }

  const product =
    await repo.findInterestProductById({
      tenantId:
        auth.tenantId,

      productId:
        body.productId,
    });

  if (!product) {
    throw httpError(
      404,
      "Interest product not found"
    );
  }

  if (
    product.status !== "active"
  ) {
    throw httpError(
      409,
      "Interest product is not active"
    );
  }

  const principal =
    Number(
      body.principalAmount
    );

  if (
    product.minimum_balance !== null &&
    principal <
      Number(
        product.minimum_balance
      )
  ) {
    throw httpError(
      422,
      "Principal is below the product minimum balance"
    );
  }

  if (
    product.maximum_balance !== null &&
    principal >
      Number(
        product.maximum_balance
      )
  ) {
    throw httpError(
      422,
      "Principal exceeds the product maximum balance"
    );
  }

  const dayFraction =
    calculateDayFraction({
      convention:
        product.day_count_convention,

      periodStart:
        body.periodStart,

      periodEnd:
        body.periodEnd,
    });

  const accruedAmount =
    Number(
      (
        principal *
        Number(
          product.annual_rate
        ) /
        100 *
        dayFraction
      ).toFixed(2)
    );

  const accrual =
    await repo.createAccrual({
      tenantId:
        auth.tenantId,

      product,

      body,

      dayFraction,

      accruedAmount,
    });

  return {
    idempotent: false,
    accrual,
  };
};

const postInterest = async ({
  auth,
  accrualId,
}) => {
  const accrual =
    await repo.findAccrualById({
      tenantId:
        auth.tenantId,

      accrualId,
    });

  if (!accrual) {
    throw httpError(
      404,
      "Interest accrual not found"
    );
  }

  if (
    accrual.status !==
    "accrued"
  ) {
    throw httpError(
      409,
      "Only accrued interest can be posted"
    );
  }

  const product =
    await repo.findInterestProductById({
      tenantId:
        auth.tenantId,

      productId:
        accrual.interest_product_id,
    });

  let entries;

  if (
    product.product_type ===
    "deposit"
  ) {
    if (
      !product.expense_ledger_account_id ||
      !accrual.customer_ledger_account_id
    ) {
      throw httpError(
        409,
        "Deposit interest ledger accounts are incomplete"
      );
    }

    entries = [
      {
        ledgerAccountId:
          product.expense_ledger_account_id,
        entryType: "debit",
        amount:
          accrual.accrued_amount,
        currency:
          accrual.currency,
      },
      {
        ledgerAccountId:
          accrual.customer_ledger_account_id,
        entryType: "credit",
        amount:
          accrual.accrued_amount,
        currency:
          accrual.currency,
      },
    ];
  } else {
    if (
      !product.income_ledger_account_id ||
      !product.receivable_ledger_account_id
    ) {
      throw httpError(
        409,
        "Interest income ledger accounts are incomplete"
      );
    }

    entries = [
      {
        ledgerAccountId:
          product.receivable_ledger_account_id,
        entryType: "debit",
        amount:
          accrual.accrued_amount,
        currency:
          accrual.currency,
      },
      {
        ledgerAccountId:
          product.income_ledger_account_id,
        entryType: "credit",
        amount:
          accrual.accrued_amount,
        currency:
          accrual.currency,
      },
    ];
  }

  const result =
    await ledgerService.postJournal({
      auth,
      body: {
        reference:
          `INT-${accrual.id}`,
        idempotencyKey:
          `interest-${accrual.id}-post`,
        transactionType:
          "interest_posting",
        sourceType:
          "interest_accrual",
        sourceId:
          accrual.id,
        entries,
      },
    });

  return repo.markAccrualPosted({
    tenantId:
      auth.tenantId,

    accrualId:
      accrual.id,

    journalId:
      result.journal.id,
  });
};

const createTreasuryPosition = ({
  auth,
  body,
}) => {
  const netLiquidity =
    Number(body.totalCashAssets) +
    Number(body.totalLoanAssets) -
    Number(body.totalCustomerLiabilities) -
    Number(body.totalInvestmentLiabilities);

  return repo.upsertTreasuryPosition({
    tenantId:
      auth.tenantId,

    currency:
      body.currency,

    positionDate:
      body.positionDate,

    liabilities:
      body.totalCustomerLiabilities,

    cashAssets:
      body.totalCashAssets,

    loanAssets:
      body.totalLoanAssets,

    investmentLiabilities:
      body.totalInvestmentLiabilities,

    netLiquidity:
      netLiquidity.toFixed(2),

    metadata:
      body.metadata,
  });
};

module.exports = {
  assessFee,
  postFee,
  waiveFee,
  createInterestProduct,
  accrueInterest,
  postInterest,
  createTreasuryPosition,
  createFeeDefinition:
    ({ auth, body }) =>
      repo.createFeeDefinition({
        tenantId:
          auth.tenantId,
        body,
        createdBy:
          auth.userId,
      }),
  listFeeDefinitions:
    ({ auth, query }) =>
      repo.listFeeDefinitions({
        tenantId:
          auth.tenantId,
        eventType:
          query.eventType || null,
        status:
          query.status || null,
      }),
  listInterestProducts:
    ({ auth, query }) =>
      repo.listInterestProducts({
        tenantId:
          auth.tenantId,
        productType:
          query.productType || null,
        status:
          query.status || null,
      }),
};
