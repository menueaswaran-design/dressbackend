const backupService = require('../services/backupService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const backup = await backupService.createDatabaseBackup();
  ApiResponse.created(res, { backup }, 'Backup created');
});

exports.list = catchAsync(async (req, res) => {
  const backups = await backupService.listBackups();
  ApiResponse.success(res, { backups });
});

exports.restore = catchAsync(async (req, res) => {
  const { filename } = req.body;
  const result = await backupService.restoreBackup(filename);
  ApiResponse.success(res, result, 'Backup restored');
});
