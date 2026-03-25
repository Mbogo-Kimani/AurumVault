const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "cron", "error"
  message: String,
  metadata: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);
