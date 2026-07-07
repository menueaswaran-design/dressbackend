const connectDB = require('./db');
const { initializeFirebase } = require('./firebase');
const { configureCloudinary } = require('./cloudinary');

const initializeApp = () => {
  connectDB();
  initializeFirebase();
  configureCloudinary();
};

module.exports = { initializeApp };
