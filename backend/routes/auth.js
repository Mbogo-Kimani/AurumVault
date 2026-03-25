const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middlewares/auth');

// 👤 Public Buyer Registration (no login required)
router.post('/register', authController.publicRegister); 
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/buyer-login', authController.buyerLogin);

// ✅ Admin-only access
router.get('/buyers', auth, adminOnly, authController.getAllBuyers);
router.delete('/buyers/:id', auth, adminOnly, authController.deleteBuyer);
router.get('/admin/summary', auth, adminOnly, authController.getBuyerSummary);



// 👑 Admin-only: Register sellers or admins
router.post('/admin/register', auth, adminOnly, authController.register);

// 🔐 Login for all users
router.post('/login', authController.login);

// 🔐 Admin-only: User Management
router.get('/users', auth, adminOnly, authController.getAllUsers);
router.put('/users/:id', auth, adminOnly, authController.editUser);
router.delete('/users/:id', auth, adminOnly, authController.deleteUser);

// 🔓 Password Reset via OTP (Public)
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPasswordWithOTP);

// 👤 User Profile (Logged-in users)
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

// ❤️ Wishlist (Logged-in users)
router.get('/wishlist', auth, authController.getWishlist);
router.put('/wishlist/:productId', auth, authController.toggleWishlist);

module.exports = router;
