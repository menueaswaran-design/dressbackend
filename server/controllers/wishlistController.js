const Customer = require('../models/Customer');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getWishlist = catchAsync(async (req, res) => {
  await req.customer.populate('wishlist', 'name slug sellingPrice mrp images stock');
  ApiResponse.success(res, { wishlist: req.customer.wishlist || [] });
});

exports.addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const exists = req.customer.wishlist.some((id) => id.toString() === productId);
  if (!exists) {
    req.customer.wishlist.push(productId);
    await req.customer.save();
  }

  await req.customer.populate('wishlist', 'name slug sellingPrice mrp images stock');
  ApiResponse.success(res, { wishlist: req.customer.wishlist }, 'Added to wishlist');
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;
  req.customer.wishlist = req.customer.wishlist.filter((id) => id.toString() !== productId);
  await req.customer.save();
  await req.customer.populate('wishlist', 'name slug sellingPrice mrp images stock');
  ApiResponse.success(res, { wishlist: req.customer.wishlist }, 'Removed from wishlist');
});
