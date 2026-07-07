const categoryService = require('../services/categoryService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  ApiResponse.created(res, { category }, 'Category created');
});

exports.getBySlug = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  ApiResponse.success(res, { category });
});

exports.get = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  ApiResponse.success(res, { category });
});

exports.list = catchAsync(async (req, res) => {
  const data = await categoryService.listCategories(req.query);
  ApiResponse.paginated(res, data.categories, data.pagination);
});

exports.update = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  ApiResponse.success(res, { category }, 'Category updated');
});

exports.remove = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  ApiResponse.noContent(res, 'Category deleted');
});
