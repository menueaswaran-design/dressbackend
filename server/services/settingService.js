const Setting = require('../models/Setting');

exports.getSettingsByGroup = async (group) => {
  return Setting.find({ group });
};

exports.getAllSettings = async () => {
  const settings = await Setting.find();
  const grouped = {};
  settings.forEach((s) => {
    if (!grouped[s.group]) grouped[s.group] = {};
    grouped[s.group][s.key] = s.value;
  });
  return grouped;
};

exports.upsertSetting = async (group, key, value, description) => {
  return Setting.findOneAndUpdate(
    { group, key },
    { value, description },
    { upsert: true, new: true }
  );
};

exports.bulkUpsertSettings = async (group, settings) => {
  const operations = settings.map((s) => ({
    updateOne: {
      filter: { group, key: s.key },
      update: { $set: { value: s.value, description: s.description } },
      upsert: true,
    },
  }));
  return Setting.bulkWrite(operations);
};
