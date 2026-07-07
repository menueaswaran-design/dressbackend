const productService = require('../services/productService');
const mediaService = require('../services/mediaService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  ApiResponse.created(res, { product }, 'Product created');
});

exports.getBySlug = catchAsync(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  ApiResponse.success(res, { product });
});

exports.get = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  ApiResponse.success(res, { product });
});

exports.list = catchAsync(async (req, res) => {
  const data = await productService.listProducts(req.query);
  ApiResponse.paginated(res, data.products, data.pagination);
});

exports.update = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  ApiResponse.success(res, { product }, 'Product updated');
});

exports.remove = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  ApiResponse.noContent(res, 'Product deleted');
});

exports.restore = catchAsync(async (req, res) => {
  const product = await productService.restoreProduct(req.params.id);
  ApiResponse.success(res, { product }, 'Product restored');
});

exports.bulkDelete = catchAsync(async (req, res) => {
  await productService.bulkDeleteProducts(req.body.ids);
  ApiResponse.noContent(res, 'Products deleted');
});

exports.bulkUpdateStatus = catchAsync(async (req, res) => {
  await productService.bulkUpdateStatus(req.body.ids, req.body.isActive);
  ApiResponse.success(res, null, 'Products updated');
});

exports.uploadImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const images = await mediaService.uploadMultiple(req.files, 'dress/products');
  ApiResponse.success(res, { images }, 'Images uploaded');
});

exports.deleteImage = catchAsync(async (req, res) => {
  const { publicId } = req.params;
  await mediaService.deleteImage(publicId);
  ApiResponse.noContent(res, 'Image deleted');
});
