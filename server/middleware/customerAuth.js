const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');
const { getAuth } = require('firebase-admin/auth');

const verifyCustomerToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await getAuth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    req.firebaseUser = decoded;

    let customer = await Customer.findOne({ firebaseUid: decoded.uid });
    if (!customer) {
      customer = await Customer.findOne({ email: decoded.email });
      if (customer) {
        customer.firebaseUid = decoded.uid;
        await customer.save();
      } else {
        customer = await Customer.create({
          firebaseUid: decoded.uid,
          name: decoded.name || decoded.email?.split('@')[0] || 'Customer',
          email: decoded.email,
        });
      }
    }

    req.customer = customer;
    next();
  } catch (error) {
    if (error.isOperational) return next(error);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

module.exports = { verifyCustomerToken };
