const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const generateSKU = (productName, variant = '') => {
  const prefix = productName.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const suffix = variant ? `-${variant.substring(0, 2).toUpperCase()}` : '';
  return `${prefix}${random}${suffix}`;
};

const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const paginateQuery = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

const getPaginationMeta = (total, page = 1, limit = 10) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const parseFilters = (query) => {
  const filter = {};
  const { search, status, category, collection, brand, stock, priceMin, priceMax, startDate, endDate, sort } = query;

  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { 'orderNumber': { $regex: search, $options: 'i' } },
  ];

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (collection) filter.collection = collection;
  if (brand) filter.brand = brand;
  if (stock === 'low') filter.stock = { $lte: '$lowStockLimit' };
  if (stock === 'out') filter.stock = 0;
  if (priceMin || priceMax) {
    filter.price = {};
    if (priceMin) filter.price.$gte = Number(priceMin);
    if (priceMax) filter.price.$lte = Number(priceMax);
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  return filter;
};

const parseSort = (sort) => {
  if (!sort) return { createdAt: -1 };
  const order = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');
  return { [field]: order };
};

module.exports = {
  generateOrderNumber,
  generateSKU,
  slugify,
  paginateQuery,
  getPaginationMeta,
  parseFilters,
  parseSort,
};
