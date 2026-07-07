const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
  },
  meta: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }],
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

cmsPageSchema.index({ slug: 1 });

module.exports = mongoose.model('CMSPage', cmsPageSchema);
