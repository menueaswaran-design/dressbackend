const cmsService = require('../services/cmsService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const page = await cmsService.createPage(req.body);
  ApiResponse.created(res, { page }, 'Page created');
});

exports.get = catchAsync(async (req, res) => {
  const page = await cmsService.getPageById(req.params.id);
  if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
  ApiResponse.success(res, { page });
});

exports.getBySlug = catchAsync(async (req, res) => {
  const page = await cmsService.getPageBySlug(req.params.slug);
  if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
  ApiResponse.success(res, { page });
});

exports.list = catchAsync(async (req, res) => {
  const data = await cmsService.listPages(req.query);
  ApiResponse.paginated(res, data.pages, data.pagination);
});

exports.update = catchAsync(async (req, res) => {
  const page = await cmsService.updatePage(req.params.id, req.body);
  ApiResponse.success(res, { page }, 'Page updated');
});

exports.remove = catchAsync(async (req, res) => {
  await cmsService.deletePage(req.params.id);
  ApiResponse.noContent(res, 'Page deleted');
});
