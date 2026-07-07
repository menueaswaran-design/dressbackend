const mongoose = require('mongoose');

const navigationItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  type: {
    type: String,
    enum: ['internal', 'external', 'mega_menu'],
    default: 'internal',
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  referenceType: {
    type: String,
    enum: ['category', 'collection', 'page', 'product'],
  },
  icon: {
    type: String,
  },
  children: [this],
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const navigationSchema = new mongoose.Schema({
  location: {
    type: String,
    enum: ['header', 'footer', 'mega_menu'],
    required: true,
    unique: true,
  },
  items: [navigationItemSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

navigationSchema.index({ location: 1 });

module.exports = mongoose.model('Navigation', navigationSchema);
