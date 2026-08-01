const repo = require("./platform-search.repository");

const pageFrom = (query) =>
  Number(query.page || 1);

const limitFrom = (query) =>
  Math.min(
    Number(query.limit || 20),
    100
  );

module.exports = {
  searchUsers: ({ query }) =>
    repo.searchUsers({
      page: pageFrom(query),
      limit: limitFrom(query),
      search: query.search,
      tenantId: query.tenantId,
      status: query.status,
      userType: query.userType,
    }),

  searchAccounts: ({ query }) =>
    repo.searchAccounts({
      page: pageFrom(query),
      limit: limitFrom(query),
      search: query.search,
      tenantId: query.tenantId,
      status: query.status,
      accountType: query.accountType,
    }),

  searchTransactions: ({ query }) =>
    repo.searchTransactions({
      page: pageFrom(query),
      limit: limitFrom(query),
      search: query.search,
      tenantId: query.tenantId,
      status: query.status,
      transactionType:
        query.transactionType,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    }),
};
