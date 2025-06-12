const mongoose = require('mongoose');
const shortid = require('shortid');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, default: () => shortid.generate(), unique: true },
    category: {
      type: String,
      required: true,
      enum: ['Ring', 'Necklace', 'Bracelet', 'Earring', 'Pendant', 'Watch', 'Other'],
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Unisex'],
    },
    quality: {
      type: String,
      required: true,
      enum: ['Standard', 'Premium', 'Luxury'],
    },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isNewArrival: { type: Boolean, default: false },
    onDiscount: { type: Boolean, default: false },
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    salePrice: { type: Number, min: 0 },
    media: [
      {
        url: String,
        public_id: String,
        type: {
          type: String, // "image" or "video"
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
