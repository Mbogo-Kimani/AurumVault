const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const logRoutes = require('./routes/logs');
const subscriberRoutes = require('./routes/subscriber');

// Load environment variables
dotenv.config();

const app = express();

// Route Logger Middleware (Diagnostic - AT TOP)
app.use((req, res, next) => {
  const start = Date.now();
  const oldSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
      try {
        console.log('Error Response:', data.toString().slice(0, 500));
      } catch (e) {}
    } else {
      console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    }
    return oldSend.apply(res, arguments);
  };

  console.log(`\n[REQ] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.query).length > 0) console.log('Query:', JSON.stringify(req.query, null, 2));
  next();
});

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configured');

// MongoDB connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 🚀 CORE API ROUTES (MOVING EARLIER)
app.get('/api/test-mounting', (req, res) => res.json({ message: 'Mounting OK', endpoints: ['auth', 'payments', 'products'] }));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Body Parser Error Handler

require('./jobs/expirePendingSales');

// Sample root route
app.get('/', (req, res) => {
  res.send('🚀 AurumVault API is live!');
});

// 404 Handler
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));
