const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'product_manager', 'order_manager', 'customer_support'],
    default: 'admin',
  },
  permissions: [{
    type: String,
  }],
  avatar: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

adminUserSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('AdminUser', adminUserSchema);
