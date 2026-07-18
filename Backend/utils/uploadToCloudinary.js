const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads an in-memory file buffer (from multer.memoryStorage()) to Cloudinary
 * and resolves with the Cloudinary result (use result.secure_url to store in DB).
 * @param {Buffer} buffer - the file buffer, e.g. req.file.buffer
 * @param {string} folder - Cloudinary folder to organize uploads, e.g. 'ssrms/rooms'
 */
function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadBufferToCloudinary };
