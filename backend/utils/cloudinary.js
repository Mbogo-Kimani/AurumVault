// utils/cloudinary.js
// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

const dotenv = require('dotenv');
const DatauriParser = require('datauri/parser');
const path = require('path');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const parser = new DatauriParser();

const formatBufferToDataUri = (file) => {
  const ext = path.extname(file.originalname).toString();
  return parser.format(ext, file.buffer);
};

module.exports = {
  cloudinary,
  formatBufferToDataUri,
};
