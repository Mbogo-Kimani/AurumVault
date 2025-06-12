const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(07|01)\d{8}$/, 'Phone number must be Kenyan and 10 digits'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [5, 'Message must be at least 5 characters'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
