const Product = require('../models/Product');
const { slugify, generateSKU, getPaginationMeta } = require('../utils/helpers');

exports.createProduct = async (data) => {
  const slug = data.slug || slugify(data.name);
  const sku = data.sku || generateSKU(data.name);

  const product = await Product.create({ ...data, slug, sku });
  return product;
};

exports.getProductById = async (id) => {
  return Product.findById(id).populate('category', 'name slug').populate('collection', 'name slug');
};

exports.getProductBySlug = async (slug) => {
  return Product.findOne({ slug, isDeleted: false }).populate('category', 'name slug');
};

exports.listProducts = async (query) => {
  const { page = 1, limit = 10, sort = '-createdAt', search, category, collection, brand, gender, status, stock, priceMin, priceMax, tags, label } = query;
  const filter = { isDeleted: false };

  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }, { tags: { $regex: search, $options: 'i' } }];
  if (category) filter.category = category;
  if (collection) filter.collection = collection;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (gender) filter.gender = gender;
  if (tags) filter.tags = { $in: tags.split(',') };
  if (label) filter.labels = { $in: label.split(',') };
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (stock === 'low') { filter.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockLimit'] }] }; }
  if (stock === 'out') filter.stock = 0;
  if (stock === 'in') filter.stock = { $gt: 0 };
  if (priceMin || priceMax) {
    filter.sellingPrice = {};
    if (priceMin) filter.sellingPrice.$gte = Number(priceMin);
    if (priceMax) filter.sellingPrice.$lte = Number(priceMax);
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .populate('collection', 'name slug')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return { products, pagination: getPaginationMeta(total, page, limit) };
};

exports.updateProduct = async (id, data) => {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  return Product.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

exports.deleteProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
};

exports.restoreProduct = async (id) => {
  return Product.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true });
};

exports.bulkDeleteProducts = async (ids) => {
  return Product.updateMany({ _id: { $in: ids } }, { isDeleted: true, deletedAt: new Date() });
};

exports.bulkUpdateStatus = async (ids, isActive) => {
  return Product.updateMany({ _id: { $in: ids } }, { isActive });
};

exports.getLowStockProducts = async (limit = 10) => {
  return Product.find({
    isDeleted: false,
    $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockLimit'] }] },
  })
    .sort({ stock: 1 })
    .limit(limit);
};

exports.getOutOfStockProducts = async (limit = 10) => {
  return Product.find({ stock: 0, isDeleted: false }).limit(limit);
};
