const Customer = require('../models/Customer');
const { getPaginationMeta } = require('../utils/helpers');

exports.listCustomers = async (query) => {
  const { page = 1, limit = 10, sort = '-createdAt', search, isActive } = query;
  const filter = { isDeleted: false };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const total = await Customer.countDocuments(filter);
  const customers = await Customer.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return { customers, pagination: getPaginationMeta(total, page, limit) };
};

exports.getCustomerById = async (id) => {
  return Customer.findById(id).populate('orderHistory', 'orderNumber total status createdAt');
};

exports.updateCustomer = async (id, data) => {
  return Customer.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

exports.deleteCustomer = async (id) => {
  return Customer.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

exports.getReturningCustomers = async () => {
  return Customer.countDocuments({ totalOrders: { $gt: 1 }, isDeleted: false });
};

exports.getTotalCustomers = async () => {
  return Customer.countDocuments({ isDeleted: false });
};
