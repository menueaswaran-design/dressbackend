const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  desktopImage: { type: String },
  mobileImage: { type: String },
  heading: { type: String },
  subHeading: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  backgroundColor: { type: String },
  textColor: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const homepageSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    enum: ['hero_banner', 'announcement_bar', 'categories', 'featured_collections', 'promotional_banner', 'instagram', 'newsletter'],
    required: true,
    unique: true,
  },
  title: {
    type: String,
  },
  heroBanners: [bannerSchema],
  announcementBar: {
    message: { type: String },
    backgroundColor: { type: String },
    textColor: { type: String },
    scrollingText: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
  },
  categories: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    displayOrder: { type: Number },
    isActive: { type: Boolean, default: true },
  }],
  featuredCollections: [{
    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
    displayOrder: { type: Number },
    isActive: { type: Boolean, default: true },
  }],
  promotionalBanner: {
    desktopImage: { type: String },
    mobileImage: { type: String },
    heading: { type: String },
    subHeading: { type: String },
    buttonText: { type: String },
    buttonLink: { type: String },
    displayOrder: { type: Number },
    isActive: { type: Boolean, default: false },
  },
  instagram: {
    images: [{ type: String }],
    apiEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
  },
  newsletter: {
    heading: { type: String },
    description: { type: String },
    successMessage: { type: String },
    isActive: { type: Boolean, default: false },
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

homepageSectionSchema.index({ sectionType: 1 });
homepageSectionSchema.index({ displayOrder: 1 });

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);
