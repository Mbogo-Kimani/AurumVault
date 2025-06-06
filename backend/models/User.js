const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
