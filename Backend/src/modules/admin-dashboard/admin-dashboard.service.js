const repo =
  require("./admin-dashboard.repository");

const toDateTime = (
  value,
  endOfDay = false
) => {
  if (!value) {
    return null;
  }

  return endOfDay
    ? `${value} 23:59:59`
    : `${value} 00:00:00`;
};

const getDefaultRange = () => {
  const end =
    new Date();

  const start =
    new Date();

  start.setDate(
    start.getDate() - 29
  );

  const format = (date) =>
    date
      .toISOString()
      .slice(0, 10);

  return {
    dateFrom:
      `${format(start)} 00:00:00`,

    dateTo:
      `${format(end)} 23:59:59`,
  };
};

const resolveRange = (query) => {
  if (
    query.dateFrom &&
    query.dateTo
  ) {
    return {
      dateFrom:
        toDateTime(
          query.dateFrom
        ),

      dateTo:
        toDateTime(
          query.dateTo,
          true
        ),
    };
  }

  return getDefaultRange();
};

const overview = ({
  auth,
  query,
}) => {
  const range =
    resolveRange(query);

  return repo.getOverview({
    tenantId:
      auth.tenantId,

    ...range,
  });
};

const transferTrend = ({
  auth,
  query,
}) => {
  const range =
    resolveRange(query);

  return repo.getTransferTrend({
    tenantId:
      auth.tenantId,

    ...range,

    granularity:
      query.granularity,
  });
};

const customerGrowth = ({
  auth,
  query,
}) => {
  const range =
    resolveRange(query);

  return repo.getCustomerGrowth({
    tenantId:
      auth.tenantId,

    ...range,
  });
};

const accountDistribution = ({
  auth,
}) =>
  repo.getAccountDistribution({
    tenantId:
      auth.tenantId,
  });

const recentActivity = ({
  auth,
  query,
}) =>
  repo.getRecentActivity({
    tenantId:
      auth.tenantId,

    limit:
      Number(query.limit),
  });

const pendingActions = ({
  auth,
}) =>
  repo.getPendingActions({
    tenantId:
      auth.tenantId,
  });

const fullDashboard = async ({
  auth,
  query,
}) => {
  const range =
    resolveRange(query);

  const [
    overviewData,
    transferTrendData,
    customerGrowthData,
    accountDistributionData,
    recentActivityData,
    pendingActionsData,
  ] = await Promise.all([
    repo.getOverview({
      tenantId:
        auth.tenantId,

      ...range,
    }),

    repo.getTransferTrend({
      tenantId:
        auth.tenantId,

      ...range,

      granularity:
        query.granularity,
    }),

    repo.getCustomerGrowth({
      tenantId:
        auth.tenantId,

      ...range,
    }),

    repo.getAccountDistribution({
      tenantId:
        auth.tenantId,
    }),

    repo.getRecentActivity({
      tenantId:
        auth.tenantId,

      limit:
        Number(
          query.activityLimit
        ),
    }),

    repo.getPendingActions({
      tenantId:
        auth.tenantId,
    }),
  ]);

  return {
    range,

    overview:
      overviewData,

    transferTrend:
      transferTrendData,

    customerGrowth:
      customerGrowthData,

    accountDistribution:
      accountDistributionData,

    recentActivity:
      recentActivityData,

    pendingActions:
      pendingActionsData,
  };
};

module.exports = {
  overview,
  transferTrend,
  customerGrowth,
  accountDistribution,
  recentActivity,
  pendingActions,
  fullDashboard,
};
