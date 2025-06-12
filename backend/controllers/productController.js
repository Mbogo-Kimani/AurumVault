// Create a product
const Product = require('../models/Product');
const { cloudinary, formatBufferToDataUri } = require('../utils/cloudinary');

exports.createProduct = async (req, res) => {
  try {
    const {
      name, category, gender, quality,
      description, price, isNewArrival,
      onDiscount, discountPercentage,
    } = req.body;

    if (!name || !category || !gender || !quality || !description || !price) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    let mediaArray = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileContent = formatBufferToDataUri(file).content;

        const result = await cloudinary.uploader.upload(fileContent, {
          resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
          folder: 'aurumvault/products',
        });

        mediaArray.push({
          url: result.secure_url,
          public_id: result.public_id,
          type: file.mimetype.startsWith('video') ? 'video' : 'image',
        });
      }
    }

    let salePrice = price;
    if (onDiscount && discountPercentage > 0) {
      salePrice = +(price - (price * discountPercentage) / 100).toFixed(2);
    }

    const newProduct = new Product({
      name,
      category,
      gender,
      quality,
      description,
      price,
      isNewArrival,
      onDiscount,
      discountPercentage,
      salePrice,
      media: mediaArray,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during product creation' });
  }
};


// Update product
exports.updateProduct = async (req, res) => {
  try {
    const updateData = req.body;

    if (updateData.price && updateData.onDiscount && updateData.discountPercentage > 0) {
      updateData.salePrice = +(
        updateData.price -
        (updateData.price * updateData.discountPercentage) / 100
      ).toFixed(2);
    } else if (updateData.onDiscount === false) {
      updateData.discountPercentage = 0;
      updateData.salePrice = updateData.price;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

/// Delete product and associated media from Cloudinary
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Delete each media item from Cloudinary
    if (Array.isArray(product.media) && product.media.length > 0) {
      for (const file of product.media) {
        try {
          const result = await cloudinary.uploader.destroy(file.public_id, {
            resource_type: file.type === 'video' ? 'video' : 'image',
          });
          console.log(`✅ Deleted from Cloudinary: ${file.public_id} (${file.type})`);
        } catch (mediaErr) {
          console.error(`❌ Failed to delete media ${file.public_id}:`, mediaErr.message);
        }
      }
    }

    // Delete product from DB
    await product.deleteOne();
    res.json({ message: 'Product and associated media deleted successfully' });
  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ error: 'Server error while deleting product' });
  }
};

// ✅ Cleaner version: Delete a single media item using query param
exports.deleteProductMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { public_id } = req.query;

    if (!public_id) {
      return res.status(400).json({ error: 'public_id query parameter is required' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const mediaToRemove = product.media.find((m) => m.public_id === public_id);
    if (!mediaToRemove) return res.status(404).json({ error: 'Media not found in product' });

    // Remove media from Cloudinary
    await cloudinary.uploader.destroy(public_id, {
      resource_type: mediaToRemove.type === 'video' ? 'video' : 'image',
    });

    // Remove media from product.media array
    product.media = product.media.filter((m) => m.public_id !== public_id);
    await product.save();

    res.json({ message: 'Media deleted successfully from Cloudinary and product' });
  } catch (err) {
    console.error('❌ Error deleting media:', err.message);
    res.status(500).json({ error: 'Server error while deleting media' });
  }
};



// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Server error while fetching products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error('Error fetching product by ID:', err.message);
    res.status(500).json({ error: 'Server error while fetching product' });
  }
};

exports.addMediaToProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let newMediaArray = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileContent = formatBufferToDataUri(file).content;

        const result = await cloudinary.uploader.upload(fileContent, {
          resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
          folder: 'aurumvault/products',
        });

        newMediaArray.push({
          url: result.secure_url,
          public_id: result.public_id,
          type: file.mimetype.startsWith('video') ? 'video' : 'image',
        });
      }

      // Append new media to existing array
      product.media.push(...newMediaArray);
      await product.save();

      res.status(200).json({
        message: 'Media added successfully',
        updatedProduct: product,
      });
    } else {
      res.status(400).json({ error: 'No media files uploaded' });
    }
  } catch (err) {
    console.error('❌ Error adding media:', err.message);
    res.status(500).json({ error: 'Server error while adding media' });
  }
};

