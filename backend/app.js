const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const productRoutes = require('./routes/productRoutes');


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configured');

// Sample root route
app.get('/', (req, res) => {
  res.send('🚀 AurumVault API is live!');
});
connectDB();

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));
