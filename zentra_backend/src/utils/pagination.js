const {
  DEFAULT_PAGINATION,
} = require("../config/constants");

const getPagination = (query = {}) => {
  const requestedPage = Number.parseInt(query.page, 10);
  const requestedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : DEFAULT_PAGINATION.PAGE;

  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(
          requestedLimit,
          DEFAULT_PAGINATION.MAX_LIMIT
        )
      : DEFAULT_PAGINATION.LIMIT;

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

const createPaginationMeta = ({
  page,
  limit,
  total,
}) => {
  const totalItems = Number(total) || 0;
  const totalPages =
    totalItems === 0
      ? 0
      : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

module.exports = {
  getPagination,
  createPaginationMeta,
};