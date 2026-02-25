const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });

    stream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;
