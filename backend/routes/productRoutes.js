const express = require('express');
const router = express.Router();
const {
  
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductMedia,
  addMediaToProduct,
} = require('../controllers/productController');
const { auth, adminOnly } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

// Public
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only
router.post('/', auth, adminOnly, upload.any(), createProduct); 
router.put('/:id', auth, adminOnly, upload.any(), updateProduct);
// Delete entire product
router.delete('/:id', auth, adminOnly, deleteProduct);
router.delete('/:id/media', auth, adminOnly, deleteProductMedia);
router.put('/:id/media', auth, adminOnly, upload.any(), addMediaToProduct);


module.exports = router;
