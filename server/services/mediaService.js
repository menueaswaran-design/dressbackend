const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  try {
    return !!(cloudinary.config().cloud_name && cloudinary.config().cloud_name !== 'your-cloud-name');
  } catch {
    return false;
  }
};

exports.uploadImage = async (file, folder = 'dress') => {
  if (isCloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  }

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return {
    url: `${baseUrl}/uploads/${file.filename}`,
    publicId: file.filename,
    format: file.originalname.split('.').pop(),
    size: file.size,
  };
};

exports.uploadMultiple = async (files, folder = 'dress') => {
  const uploads = files.map((file) => exports.uploadImage(file, folder));
  return Promise.all(uploads);
};

exports.deleteImage = async (publicId) => {
  if (isCloudinaryConfigured()) {
    return cloudinary.uploader.destroy(publicId);
  }
  return { result: 'ok' };
};

exports.bulkDeleteImages = async (publicIds) => {
  const operations = publicIds.map((id) => exports.deleteImage(id));
  return Promise.all(operations);
};

exports.listImages = async (folder = 'dress', nextCursor) => {
  if (isCloudinaryConfigured()) {
    const options = {
      folder,
      max_results: 50,
      resource_type: 'image',
    };
    if (nextCursor) options.next_cursor = nextCursor;

    const result = await cloudinary.api.resources(options);
    return {
      images: result.resources.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
        size: r.bytes,
        createdAt: r.created_at,
      })),
      nextCursor: result.next_cursor,
      totalCount: result.total_count,
    };
  }

  return { images: [], nextCursor: null, totalCount: 0 };
};
