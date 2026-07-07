const Collection = require('../models/Collection');
const { slugify, getPaginationMeta } = require('../utils/helpers');

exports.createCollection = async (data) => {
  const slug = data.slug || slugify(data.name);
  const collection = await Collection.create({ ...data, slug });
  return collection;
};

exports.getCollectionById = async (id) => {
  return Collection.findById(id).populate('products', 'name sellingPrice images slug');
};

exports.getCollectionBySlug = async (slug) => {
  return Collection.findOne({ slug, isDeleted: false }).populate('products', 'name sellingPrice images slug mrp');
};

exports.listCollections = async (query) => {
  const { page = 1, limit = 20, sort = 'displayOrder', search, isActive } = query;
  const filter = { isDeleted: false };

  if (search) filter.name = { $regex: search, $options: 'i' };
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const total = await Collection.countDocuments(filter);
  const collections = await Collection.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return { collections, pagination: getPaginationMeta(total, page, limit) };
};

exports.updateCollection = async (id, data) => {
  if (data.name && !data.slug) {
    data.slug = slugify(data.name);
  }
  return Collection.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

exports.deleteCollection = async (id) => {
  return Collection.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

exports.addProductsToCollection = async (collectionId, productIds) => {
  await Collection.findByIdAndUpdate(collectionId, { $addToSet: { products: { $each: productIds } } });
  return Collection.findById(collectionId).populate('products', 'name sellingPrice images slug');
};

exports.removeProductsFromCollection = async (collectionId, productIds) => {
  await Collection.findByIdAndUpdate(collectionId, { $pull: { products: { $in: productIds } } });
  return Collection.findById(collectionId).populate('products', 'name sellingPrice images slug');
};
