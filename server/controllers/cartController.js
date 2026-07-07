const Customer = require('../models/Customer');
const Product = require('../models/Product');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getCart = catchAsync(async (req, res) => {
  await req.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  ApiResponse.success(res, { cart: req.customer.cart || [] });
});

exports.addToCart = catchAsync(async (req, res) => {
  const { productId, quantity = 1, size, color } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const existingIndex = req.customer.cart.findIndex(
    (item) => item.product.toString() === productId && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    req.customer.cart[existingIndex].quantity = Math.min(
      req.customer.cart[existingIndex].quantity + quantity,
      product.stock || 99
    );
  } else {
    req.customer.cart.push({
      product: productId,
      name: product.name,
      price: product.sellingPrice,
      quantity,
      size,
      color,
      image: product.images?.[0]?.url || '',
      stock: product.stock || 99,
    });
  }

  await req.customer.save();
  await req.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  ApiResponse.success(res, { cart: req.customer.cart }, 'Added to cart');
});

exports.updateCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const item = req.customer.cart.id(itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });
  item.quantity = Math.max(1, quantity);
  await req.customer.save();
  await req.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  ApiResponse.success(res, { cart: req.customer.cart }, 'Cart updated');
});

exports.removeFromCart = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  req.customer.cart = req.customer.cart.filter((item) => item._id.toString() !== itemId);
  await req.customer.save();
  await req.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  ApiResponse.success(res, { cart: req.customer.cart }, 'Removed from cart');
});

exports.clearCart = catchAsync(async (req, res) => {
  req.customer.cart = [];
  await req.customer.save();
  ApiResponse.success(res, { cart: [] }, 'Cart cleared');
});
