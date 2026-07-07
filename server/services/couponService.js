const Coupon = require('../models/Coupon');
const { getPaginationMeta } = require('../utils/helpers');

exports.createCoupon = async (data) => {
  data.code = data.code.toUpperCase();
  return Coupon.create(data);
};

exports.getCouponById = async (id) => {
  return Coupon.findById(id);
};

exports.getCouponByCode = async (code) => {
  return Coupon.findOne({ code: code.toUpperCase(), isActive: true, isDeleted: false });
};

exports.listCoupons = async (query) => {
  const { page = 1, limit = 10, sort = '-createdAt', search, type, isActive } = query;
  const filter = { isDeleted: false };

  if (search) filter.code = { $regex: search, $options: 'i' };
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const total = await Coupon.countDocuments(filter);
  const coupons = await Coupon.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return { coupons, pagination: getPaginationMeta(total, page, limit) };
};

exports.updateCoupon = async (id, data) => {
  if (data.code) data.code = data.code.toUpperCase();
  return Coupon.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
};

exports.deleteCoupon = async (id) => {
  return Coupon.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

exports.validateCoupon = async (code, cartTotal, userId) => {
  const coupon = await this.getCouponByCode(code);
  if (!coupon) throw new Error('Invalid coupon code');

  if (coupon.expiresAt < new Date()) throw new Error('Coupon has expired');
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) throw new Error('Coupon usage limit reached');
  if (cartTotal < coupon.minPurchase) throw new Error(`Minimum purchase of ${coupon.minPurchase} required`);

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === 'flat') {
    discount = coupon.value;
  } else if (coupon.type === 'free_shipping') {
    discount = 0;
  }

  return { coupon, discount };
};
