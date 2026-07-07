const HomepageSection = require('../models/HomepageSection');

exports.getAllSections = async () => {
  return HomepageSection.find({ isActive: true }).sort({ displayOrder: 1 });
};

exports.getSectionByType = async (sectionType) => {
  return HomepageSection.findOne({ sectionType });
};

exports.upsertSection = async (sectionType, data) => {
  return HomepageSection.findOneAndUpdate(
    { sectionType },
    { $set: data },
    { upsert: true, new: true, runValidators: true }
  );
};

exports.updateHeroBanners = async (data) => {
  return HomepageSection.findOneAndUpdate(
    { sectionType: 'hero_banner' },
    { $set: { heroBanners: data.heroBanners } },
    { upsert: true, new: true }
  );
};

exports.updateAnnouncementBar = async (data) => {
  return HomepageSection.findOneAndUpdate(
    { sectionType: 'announcement_bar' },
    { $set: { announcementBar: data } },
    { upsert: true, new: true }
  );
};

exports.updateNewsletter = async (data) => {
  return HomepageSection.findOneAndUpdate(
    { sectionType: 'newsletter' },
    { $set: { newsletter: data } },
    { upsert: true, new: true }
  );
};

exports.updateInstagram = async (data) => {
  return HomepageSection.findOneAndUpdate(
    { sectionType: 'instagram' },
    { $set: { instagram: data } },
    { upsert: true, new: true }
  );
};
