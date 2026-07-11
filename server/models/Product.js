const mongoose = require('mongoose');

const variantSizeSchema = new mongoose.Schema({
  size: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String },
});

const variantSchema = new mongoose.Schema({
  name: { type: String },
  images: [{ type: String }],
  primaryImage: { type: String },
  sizes: [variantSizeSchema],
  isActive: { type: Boolean, default: true },
});

const sizeChartSchema = new mongoose.Schema({
  label: { type: String },
  values: { type: Map, of: String },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex', 'kids'],
  },
  tags: [{
    type: String,
  }],
  mrp: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  stock: {
    type: Number,
    default: 0,
  },
  lowStockLimit: {
    type: Number,
    default: 5,
  },
  barcode: {
    type: String,
  },
  weight: {
    type: Number,
  },
  images: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['front', 'back', 'side', 'close-up', 'lifestyle'] },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  }],
  video: {
    type: String,
  },
  variants: [variantSchema],
  description: {
    type: String,
  },
  sizeChart: [sizeChartSchema],
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }],
    canonicalUrl: { type: String },
    slug: { type: String },
  },
  shipping: {
    weight: { type: Number },
    height: { type: Number },
    width: { type: Number },
    length: { type: Number },
    packageType: { type: String },
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  labels: [{
    type: String,
    enum: ['new', 'sale', 'trending', 'bestseller', 'limited_edition'],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

productSchema.index({ name: 'text', tags: 'text', 'seo.keywords': 'text' });
productSchema.index({ category: 1, isActive: 1, isDeleted: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
