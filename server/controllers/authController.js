const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.login = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const firebaseUser = await authService.verifyFirebaseToken(idToken);
  const adminUser = await authService.findOrCreateAdmin(firebaseUser);
  await authService.logActivity(adminUser._id, 'login', 'AdminUser', adminUser._id, {}, req);
  ApiResponse.success(res, { admin: adminUser }, 'Login successful');
});

exports.getProfile = catchAsync(async (req, res) => {
  const admin = await authService.getAdminProfile(req.adminUser._id);
  ApiResponse.success(res, { admin });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const admin = await authService.updateAdminProfile(req.adminUser._id, req.body);
  await authService.logActivity(req.adminUser._id, 'update_profile', 'AdminUser', admin._id, req.body, req);
  ApiResponse.success(res, { admin }, 'Profile updated');
});

exports.listAdmins = catchAsync(async (req, res) => {
  const data = await authService.listAdmins(req.query);
  ApiResponse.paginated(res, { admins: data.admins }, { total: data.total, page: data.page, totalPages: data.totalPages });
});

exports.createAdmin = catchAsync(async (req, res) => {
  const admin = await authService.createAdmin(req.body);
  await authService.logActivity(req.adminUser._id, 'create_admin', 'AdminUser', admin._id, req.body, req);
  ApiResponse.created(res, { admin }, 'Admin created');
});

exports.updateAdmin = catchAsync(async (req, res) => {
  const admin = await authService.updateAdmin(req.params.id, req.body);
  await authService.logActivity(req.adminUser._id, 'update_admin', 'AdminUser', admin._id, req.body, req);
  ApiResponse.success(res, { admin }, 'Admin updated');
});

exports.deleteAdmin = catchAsync(async (req, res) => {
  await authService.deleteAdmin(req.params.id);
  await authService.logActivity(req.adminUser._id, 'delete_admin', 'AdminUser', req.params.id, {}, req);
  ApiResponse.noContent(res);
});

exports.disableAdmin = catchAsync(async (req, res) => {
  const admin = await authService.disableAdmin(req.params.id);
  ApiResponse.success(res, { admin }, 'Admin disabled');
});

exports.enableAdmin = catchAsync(async (req, res) => {
  const admin = await authService.enableAdmin(req.params.id);
  ApiResponse.success(res, { admin }, 'Admin enabled');
});
