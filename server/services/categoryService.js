const Category = require('../models/Category');
const { slugify, getPaginationMeta } = require('../utils/helpers');

exports.createCategory = async (data) => {
  const slug = data.slug || slugify(data.name);
  const category = await Category.create({ ...data, slug });
  return category;
};

exports.getCategoryById = async (id) => {
  return Category.findById(id).populate('parentCategory', 'name slug');
};

exports.getCategoryBySlug = async (slug) => {
  return Category.findOne({ slug, isDeleted: false });
};

exports.listCategories = async (query) => {
  const { page = 1, limit = 50, sort = 'displayOrder', search, isActive } = query;
  const filter = { isDeleted: false };

  if (search) filter.name = { $regex: search, $options: 'i' };
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const total = await Category.countDocuments(filter);
  const categories = await Category.find(filter)
    .populate('parentCategory', 'name slug')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return { categories, pagination: getPaginationMeta(total, page, limit) };
};

exports.updateCategory = async (id, data) => {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  return Category.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

exports.deleteCategory = async (id) => {
  return Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};
