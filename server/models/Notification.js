const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_order', 'low_stock', 'failed_payment', 'cancelled_order', 'order_confirmation', 'shipping_update', 'delivery_update'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    enum: ['admin', 'customer'],
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  channel: {
    type: String,
    enum: ['email', 'whatsapp', 'in_app'],
    default: 'in_app',
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  referenceType: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isSent: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ recipient: 1, recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
