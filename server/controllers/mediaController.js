const mediaService = require('../services/mediaService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.upload = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const image = await mediaService.uploadImage(req.file);
  ApiResponse.created(res, { image }, 'File uploaded');
});

exports.uploadMultiple = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }
  const images = await mediaService.uploadMultiple(req.files);
  ApiResponse.created(res, { images }, 'Files uploaded');
});

exports.list = catchAsync(async (req, res) => {
  const { folder, nextCursor } = req.query;
  const data = await mediaService.listImages(folder, nextCursor);
  ApiResponse.success(res, data);
});

exports.remove = catchAsync(async (req, res) => {
  await mediaService.deleteImage(req.params.publicId);
  ApiResponse.noContent(res, 'File deleted');
});

exports.bulkRemove = catchAsync(async (req, res) => {
  await mediaService.bulkDeleteImages(req.body.publicIds);
  ApiResponse.noContent(res, 'Files deleted');
});
