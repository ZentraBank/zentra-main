const repo =
  require("./reports.repository");

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

const reportLoaders = {
  transfers:
    repo.getTransfersReport,

  accounts:
    repo.getAccountsReport,

  users:
    repo.getUsersReport,

  subscriptions:
    repo.getSubscriptionsReport,

  kyc:
    repo.getKycReport,

  loans:
    repo.getLoansReport,

  investments:
    repo.getInvestmentsReport,

  donations:
    repo.getDonationsReport,
};

const resolvePagination = (
  query
) => {
  const page =
    Number(query.page);

  const pageSize =
    Math.min(
      Number(query.pageSize),
      500
    );

  return {
    limit:
      pageSize,

    offset:
      (page - 1) *
      pageSize,
  };
};

const buildFilters = (
  query
) => ({
  dateFrom:
    query.dateFrom || null,

  dateTo:
    query.dateTo || null,

  status:
    query.status || null,

  currency:
    query.currency || null,
});

const getReport = async ({
  auth,
  reportType,
  query,
}) => {
  const loader =
    reportLoaders[
      reportType
    ];

  if (!loader) {
    throw httpError(
      404,
      "Unsupported report type"
    );
  }

  return loader({
    tenantId:
      auth.tenantId,

    filters:
      buildFilters(query),

    ...resolvePagination(query),
  });
};

const toCsvValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    value =
      JSON.stringify(value);
  }

  const stringValue =
    String(value);

  return `"${stringValue.replace(
    /"/g,
    '""'
  )}"`;
};

const rowsToCsv = (rows) => {
  if (!rows.length) {
    return "";
  }

  const headers =
    Object.keys(rows[0]);

  const lines = [
    headers
      .map(toCsvValue)
      .join(","),
  ];

  for (const row of rows) {
    lines.push(
      headers
        .map((header) =>
          toCsvValue(
            row[header]
          )
        )
        .join(",")
    );
  }

  return lines.join("\n");
};

const exportNow = async ({
  auth,
  reportType,
  query,
}) => {
  const format =
    query.format;

  const exportRecord =
    await repo.createExport({
      tenantId:
        auth.tenantId,

      requestedBy:
        auth.userId,

      reportType,

      format,

      filters:
        buildFilters(query),
    });

  await repo.markProcessing({
    tenantId:
      auth.tenantId,

    exportId:
      exportRecord.id,
  });

  try {
    const rows =
      await getReport({
        auth,

        reportType,

        query: {
          ...query,
          page: 1,
          pageSize:
            query.exportLimit,
        },
      });

    const content =
      format === "json"
        ? JSON.stringify(
            rows,
            null,
            2
          )
        : rowsToCsv(rows);

    const extension =
      format === "json"
        ? "json"
        : "csv";

    const fileName =
      `${reportType}-${Date.now()}.${extension}`;

    const expiresAt =
      new Date(
        Date.now() +
        24 * 60 * 60 * 1000
      );

    const completed =
      await repo.markCompleted({
        tenantId:
          auth.tenantId,

        exportId:
          exportRecord.id,

        fileName,

        fileUrl:
          null,

        rowCount:
          rows.length,

        expiresAt,
      });

    return {
      export:
        completed,

      fileName,

      contentType:
        format === "json"
          ? "application/json"
          : "text/csv",

      content,
    };
  } catch (error) {
    await repo.markFailed({
      tenantId:
        auth.tenantId,

      exportId:
        exportRecord.id,

      reason:
        error.message,
    });

    throw error;
  }
};

const listExports = ({
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

  return repo.listExports({
    tenantId:
      auth.tenantId,

    requestedBy:
      auth.userId,

    adminView,

    status:
      query.status || null,

    limit,

    offset:
      (page - 1) *
      limit,
  });
};

const getExport = async ({
  auth,
  exportId,
  adminView = false,
}) => {
  const item =
    await repo.findExportById({
      tenantId:
        auth.tenantId,

      exportId,
    });

  if (
    !item ||
    (
      !adminView &&
      item.requested_by !==
        auth.userId
    )
  ) {
    throw httpError(
      404,
      "Report export not found"
    );
  }

  return item;
};

module.exports = {
  getReport,
  exportNow,
  listExports,
  getExport,
};
