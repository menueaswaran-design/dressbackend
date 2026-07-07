const Navigation = require('../models/Navigation');

exports.getNavigationByLocation = async (location) => {
  return Navigation.findOne({ location, isActive: true });
};

exports.upsertNavigation = async (location, data) => {
  return Navigation.findOneAndUpdate(
    { location },
    { $set: { items: data.items, isActive: data.isActive ?? true } },
    { upsert: true, new: true }
  );
};

exports.updateNavigationItems = async (location, items) => {
  return Navigation.findOneAndUpdate(
    { location },
    { $set: { items } },
    { new: true }
  );
};
