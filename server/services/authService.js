const AdminUser = require('../models/AdminUser');
const ActivityLog = require('../models/ActivityLog');
const { getAuth } = require('firebase-admin/auth');

exports.verifyFirebaseToken = async (idToken) => {
  const decoded = await getAuth().verifyIdToken(idToken);
  return decoded;
};

exports.findOrCreateAdmin = async (firebaseUser) => {
  let adminUser = await AdminUser.findOne({ firebaseUid: firebaseUser.uid });

  if (!adminUser) {
    adminUser = await AdminUser.create({
      firebaseUid: firebaseUser.uid,
      name: firebaseUser.name || firebaseUser.email?.split('@')[0] || 'Admin',
      email: firebaseUser.email,
      role: 'admin',
    });
  }

  adminUser.lastLogin = new Date();
  await adminUser.save();

  return adminUser;
};

exports.getAdminProfile = async (adminId) => {
  return AdminUser.findById(adminId).select('-__v');
};

exports.updateAdminProfile = async (adminId, data) => {
  return AdminUser.findByIdAndUpdate(adminId, { $set: data }, { new: true, runValidators: true });
};

exports.listAdmins = async (query) => {
  const { page = 1, limit = 10, sort = '-createdAt', search, role, isActive } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const total = await AdminUser.countDocuments(filter);
  const admins = await AdminUser.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-__v');

  return {
    admins,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

exports.createAdmin = async (data) => {
  const firebaseUser = await getAuth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.name,
  });

  const adminUser = await AdminUser.create({
    firebaseUid: firebaseUser.uid,
    name: data.name,
    email: data.email,
    role: data.role || 'admin',
  });

  return adminUser;
};

exports.updateAdmin = async (id, data) => {
  const adminUser = await AdminUser.findById(id);
  if (!adminUser) throw new Error('Admin not found');

  if (data.email && data.email !== adminUser.email) {
    await getAuth().updateUser(adminUser.firebaseUid, { email: data.email });
  }
  if (data.name) {
    await getAuth().updateUser(adminUser.firebaseUid, { displayName: data.name });
  }

  Object.assign(adminUser, data);
  return adminUser.save();
};

exports.deleteAdmin = async (id) => {
  const adminUser = await AdminUser.findById(id);
  if (!adminUser) throw new Error('Admin not found');

  await getAuth().deleteUser(adminUser.firebaseUid);
  return AdminUser.findByIdAndDelete(id);
};

exports.disableAdmin = async (id) => {
  return AdminUser.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

exports.enableAdmin = async (id) => {
  return AdminUser.findByIdAndUpdate(id, { isActive: true }, { new: true });
};

exports.logActivity = async (adminId, action, resource, resourceId, details, req) => {
  return ActivityLog.create({
    admin: adminId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req?.ip,
    userAgent: req?.headers?.['user-agent'],
  });
};
