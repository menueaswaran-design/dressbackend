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
    enum: ['hero_banner', 'announcement_bar', 'categories', 'featured_collections', 'promotional_banner', 'brand_story', 'instagram', 'newsletter'],
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
    backgroundColor: { type: String, default: '#111827' },
    textColor: { type: String, default: '#ffffff' },
    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
    displayOrder: { type: Number },
    isActive: { type: Boolean, default: false },
  },
  brandStory: {
    heading: { type: String, default: 'Designed for the Modern Individual' },
    subHeading: { type: String, default: 'Our Story' },
    description: { type: String },
    buttonText: { type: String, default: 'Explore Collection' },
    buttonLink: { type: String, default: '/shop' },
    secondaryButtonText: { type: String, default: 'Learn More' },
    secondaryButtonLink: { type: String, default: '/about' },
    image: { type: String },
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
