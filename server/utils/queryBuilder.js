const queryBuilder = (model, query, searchFields = []) => {
  let queryObj = { ...query };
  const excludeFields = ['page', 'limit', 'search', 'sortBy', 'order', 'select'];
  excludeFields.forEach(field => delete queryObj[field]);

  let searchQuery = {};
  if (query.search && searchFields.length > 0) {
    searchQuery.$or = searchFields.map(field => ({
      [field]: { $regex: query.search, $options: 'i' }
    }));
  }

  const combinedQuery = { ...queryObj, ...searchQuery };

  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const select = query.select ? query.select.split(',').join(' ') : '';

  const runQuery = async () => {
    const total = await model.countDocuments(combinedQuery);
    const data = await model.find(combinedQuery)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  };

  return { query: combinedQuery, sort, skip, limit, page, runQuery };
};

module.exports = queryBuilder;