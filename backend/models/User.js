const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    /* roles:
       - user   → buyer / normal customer
       - seller → store staff who manage products
       - admin  → full control
    */
    role: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      default: 'unisex',
    },

    /* ---------- Password‑reset (already in place) ---------- */
    resetOTP:        { type: String },
    resetOTPExpires: { type: Date },

    /* ---------- Email‑verification (NEW) ---------- */
    isEmailVerified:  { type: Boolean, default: false },
    emailOTP:         { type: String },
    emailOTPExpires:  { type: Date },

    /* ---------- Profile Info (NEW) ---------- */
    phone:   { type: String },
    address: { type: String },
    city:    { type: String },
    
    /* ---------- Wishlist ---------- */
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
