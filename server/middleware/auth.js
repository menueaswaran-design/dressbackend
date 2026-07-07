const AdminUser = require('../models/AdminUser');
const ApiError = require('../utils/ApiError');
const { getAuth } = require('firebase-admin/auth');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await getAuth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    req.firebaseUser = decoded;

    const adminUser = await AdminUser.findOne({ firebaseUid: decoded.uid });
    if (!adminUser) {
      throw ApiError.unauthorized('Admin user not found');
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.adminUser.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
};

module.exports = { verifyToken, authorize };
