const settingService = require('../services/settingService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getAll = catchAsync(async (req, res) => {
  const settings = await settingService.getAllSettings();
  ApiResponse.success(res, { settings });
});

exports.getByGroup = catchAsync(async (req, res) => {
  const settings = await settingService.getSettingsByGroup(req.params.group);
  ApiResponse.success(res, { settings });
});

exports.upsert = catchAsync(async (req, res) => {
  const { key, value, description } = req.body;
  const setting = await settingService.upsertSetting(req.params.group, key, value, description);
  ApiResponse.success(res, { setting }, 'Setting updated');
});

exports.bulkUpsert = catchAsync(async (req, res) => {
  await settingService.bulkUpsertSettings(req.params.group, req.body.settings);
  ApiResponse.success(res, null, 'Settings updated');
});
