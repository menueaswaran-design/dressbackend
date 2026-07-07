let cloudinaryInstance = null;

const configureCloudinary = () => {
  try {
    const cloudinary = require('cloudinary').v2;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name') {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      cloudinaryInstance = cloudinary;
      console.log('Cloudinary configured');
    } else {
      console.warn('Cloudinary not configured. File uploads will use local storage.');
    }
    return { cloudinary: cloudinaryInstance || cloudinary };
  } catch (error) {
    console.warn('Cloudinary configuration failed:', error.message);
    return { cloudinary: null };
  }
};

module.exports = { configureCloudinary, cloudinary: () => cloudinaryInstance };
