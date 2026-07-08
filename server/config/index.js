const connectDB = require('./db');
const { initializeFirebase } = require('./firebase');
const { configureCloudinary } = require('./cloudinary');

const initializeApp = async () => {
  await connectDB();
  initializeFirebase();
  configureCloudinary();
};

module.exports = { initializeApp };
