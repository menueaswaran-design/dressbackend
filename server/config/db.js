const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error.message}. Server will start without database.`);
    console.warn('Set MONGODB_URI in .env to a valid MongoDB connection string.');
    return null;
  }
};

module.exports = connectDB;
