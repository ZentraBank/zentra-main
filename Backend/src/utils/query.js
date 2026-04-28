function getPagination(query) {
  const limit = Math.min(Number(query.limit) || 20, 100);
  const page = Math.max(Number(query.page) || 1, 1);
  const offset = (page - 1) * limit;

  return { limit, page, offset };
}

function cleanFilters(query, allowedFilters = []) {
  const filters = {};

  allowedFilters.forEach((key) => {
    if (query[key] !== undefined && query[key] !== "") {
      filters[key] = query[key];
    }
  });

  return filters;
}

module.exports = {
  getPagination,
  cleanFilters,
};