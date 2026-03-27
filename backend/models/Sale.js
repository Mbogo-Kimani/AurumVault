const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: Number,
      price: Number,
    }
  ],
  productName: String,
  buyerName: String,
  buyerEmail: String,
  phoneNumber: String,
  amount: Number,
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending',
  },
  transactionId: String,
  receiptNumber: String,
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'cash'],
    default: 'mpesa',
  },
  sellerName: String,
  
  /* ---------- Fulfillment Info (NEW) ---------- */
  fulfillmentType: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'delivery',
  },
  deliveryDetails: {
    address: String,
    city:    String,
    note:    String,
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'In-Transit', 'Delivered', 'Received', 'Returned', 'Failed'],
    default: 'Pending',
  },
  isReturnRequested: {
    type: Boolean,
    default: false,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sale', saleSchema);
