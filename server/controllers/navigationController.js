const navigationService = require('../services/navigationService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getByLocation = catchAsync(async (req, res) => {
  const navigation = await navigationService.getNavigationByLocation(req.params.location);
  if (!navigation) return res.status(404).json({ success: false, message: 'Navigation not found' });
  ApiResponse.success(res, { navigation });
});

exports.upsert = catchAsync(async (req, res) => {
  const navigation = await navigationService.upsertNavigation(req.params.location, req.body);
  ApiResponse.success(res, { navigation }, 'Navigation updated');
});

exports.updateItems = catchAsync(async (req, res) => {
  const navigation = await navigationService.updateNavigationItems(req.params.location, req.body.items);
  ApiResponse.success(res, { navigation }, 'Navigation items updated');
});
