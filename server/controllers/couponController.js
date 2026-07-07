const couponService = require('../services/couponService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  ApiResponse.created(res, { coupon }, 'Coupon created');
});

exports.get = catchAsync(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  ApiResponse.success(res, { coupon });
});

exports.list = catchAsync(async (req, res) => {
  const data = await couponService.listCoupons(req.query);
  ApiResponse.paginated(res, data.coupons, data.pagination);
});

exports.update = catchAsync(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  ApiResponse.success(res, { coupon }, 'Coupon updated');
});

exports.remove = catchAsync(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  ApiResponse.noContent(res, 'Coupon deleted');
});

exports.validate = catchAsync(async (req, res) => {
  const { code, cartTotal } = req.body;
  const result = await couponService.validateCoupon(code, cartTotal);
  ApiResponse.success(res, result, 'Coupon is valid');
});
