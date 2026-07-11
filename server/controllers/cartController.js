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

  let variantPrice = product.sellingPrice;
  let variantStock = product.stock;
  let variantImage = product.images?.[0]?.url || '';
  if (size && product.variants?.length > 0) {
    for (const v of product.variants) {
      if (v.sizes?.length > 0) {
        const sizeItem = v.sizes.find((s) => s.size === size);
        if (sizeItem) {
          variantPrice = sizeItem.price;
          variantStock = sizeItem.stock;
          variantImage = v.primaryImage || v.images?.[0] || variantImage;
          break;
        }
      } else if (v.size === size) {
        variantPrice = v.price || variantPrice;
        variantStock = v.stock ?? variantStock;
        variantImage = v.image || variantImage;
        break;
      }
    }
  }

  const existingIndex = req.customer.cart.findIndex(
    (item) => item.product.toString() === productId && item.size === size && item.color === (color || '')
  );

  if (existingIndex > -1) {
    req.customer.cart[existingIndex].quantity = Math.min(
      req.customer.cart[existingIndex].quantity + quantity,
      variantStock || 99
    );
  } else {
    req.customer.cart.push({
      product: productId,
      name: product.name,
      price: variantPrice,
      quantity,
      size,
      color: color || '',
      image: variantImage,
      stock: variantStock || 99,
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
