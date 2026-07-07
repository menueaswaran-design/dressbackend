const CMSPage = require('../models/CMSPage');
const { slugify, getPaginationMeta } = require('../utils/helpers');

exports.createPage = async (data) => {
  const slug = data.slug || slugify(data.title);
  return CMSPage.create({ ...data, slug });
};

exports.getPageById = async (id) => {
  return CMSPage.findById(id);
};

exports.getPageBySlug = async (slug) => {
  return CMSPage.findOne({ slug, isActive: true, isDeleted: false });
};

exports.listPages = async (query) => {
  const { page = 1, limit = 20, sort = '-createdAt', search } = query;
  const filter = { isDeleted: false };

  if (search) filter.title = { $regex: search, $options: 'i' };

  const total = await CMSPage.countDocuments(filter);
  const pages = await CMSPage.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);

  return { pages, pagination: getPaginationMeta(total, page, limit) };
};

exports.updatePage = async (id, data) => {
  if (data.title && !data.slug) {
    data.slug = slugify(data.title);
  }
  return CMSPage.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

exports.deletePage = async (id) => {
  return CMSPage.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};
