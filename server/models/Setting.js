const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  group: {
    type: String,
    required: true,
    enum: ['general', 'seo', 'social', 'footer', 'payment', 'notification'],
  },
  key: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

settingSchema.index({ group: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Setting', settingSchema);
