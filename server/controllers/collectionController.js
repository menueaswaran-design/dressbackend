const collectionService = require('../services/collectionService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const collection = await collectionService.createCollection(req.body);
  ApiResponse.created(res, { collection }, 'Collection created');
});

exports.get = catchAsync(async (req, res) => {
  const collection = await collectionService.getCollectionById(req.params.id);
  if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
  ApiResponse.success(res, { collection });
});

exports.getBySlug = catchAsync(async (req, res) => {
  const collection = await collectionService.getCollectionBySlug(req.params.slug);
  if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
  ApiResponse.success(res, { collection });
});

exports.list = catchAsync(async (req, res) => {
  const data = await collectionService.listCollections(req.query);
  ApiResponse.paginated(res, data.collections, data.pagination);
});

exports.update = catchAsync(async (req, res) => {
  const collection = await collectionService.updateCollection(req.params.id, req.body);
  ApiResponse.success(res, { collection }, 'Collection updated');
});

exports.remove = catchAsync(async (req, res) => {
  await collectionService.deleteCollection(req.params.id);
  ApiResponse.noContent(res, 'Collection deleted');
});

exports.addProducts = catchAsync(async (req, res) => {
  const collection = await collectionService.addProductsToCollection(req.params.id, req.body.productIds);
  ApiResponse.success(res, { collection }, 'Products added to collection');
});

exports.removeProducts = catchAsync(async (req, res) => {
  const collection = await collectionService.removeProductsFromCollection(req.params.id, req.body.productIds);
  ApiResponse.success(res, { collection }, 'Products removed from collection');
});
