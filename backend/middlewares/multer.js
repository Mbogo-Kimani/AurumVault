// middlewares/multer.js
const multer = require('multer');

const storage = multer.memoryStorage(); // Keep in memory for Cloudinary

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG images and MP4 videos are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
