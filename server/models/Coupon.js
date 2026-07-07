const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'flat', 'buy_x_get_y', 'free_shipping'],
    required: true,
  },
  value: {
    type: Number,
    required: function() { return this.type !== 'free_shipping'; },
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
  },
  buyXGetY: {
    buyQuantity: { type: Number },
    getQuantity: { type: Number },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  },
  usageLimit: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

couponSchema.index({ code: 1 });
couponSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
