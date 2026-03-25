const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, gender } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashed, role, gender });
    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit User (Admin only)
exports.editUser = async (req, res) => {
  try {
    const { name, email, role, gender, password } = req.body;

    const updateFields = { name, email, role, gender };

    if (password && password.trim() !== '') {
      // Hash new password if it's provided
      updateFields.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Delete User (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ msg: 'User not found' });

    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOTP = otp;
    user.resetOTPExpires = expires;
    await user.save();

    await emailService.sendOtp(user.email, user.name, otp, 'reset');

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('OTP Request Error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOTP !== otp ||
      !user.resetOTPExpires ||
      user.resetOTPExpires < new Date()
    ) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error('Reset Error:', err.message);
    res.status(500).json({ error: 'Password reset failed' });
  }
};


// 🧾 Buyer Public Registration
exports.publicRegister = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name,
      email,
      password: hashed,
      gender,
      emailOTP: otp,
      emailOTPExpires: expires,
      isEmailVerified: false,
    });

    await user.save();

    await emailService.sendOtp(user.email, user.name, otp, 'verification');

    res.status(201).json({ msg: 'Account created. Please verify your email.' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

 // Verify Email
 exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (
      !user ||
      user.isEmailVerified ||
      user.emailOTP !== otp ||
      !user.emailOTPExpires ||
      user.emailOTPExpires < new Date()
    ) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    res.status(200).json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error('Email Verification Error:', err.message);
    res.status(500).json({ error: 'Failed to verify email' });
  }
};

// 🔄 Resend Verification Email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ msg: 'Email is already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailOTP = otp;
    user.emailOTPExpires = expires;
    await user.save();

    await emailService.sendOtp(user.email, user.name, otp, 'verification');

    res.status(200).json({ msg: 'Verification code resent successfully' });
  } catch (err) {
    console.error('Resend Verification Error:', err.message);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
};


// 🛒 Buyer Login Only
exports.buyerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const buyer = await User.findOne({ email, role: 'user' });
    if (!buyer) return res.status(400).json({ msg: 'Invalid buyer credentials' });

    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid buyer credentials' });
    if (!buyer.isEmailVerified) {
  return res.status(401).json({ msg: 'Please verify your email before logging in.' });
}


    const token = jwt.sign({ id: buyer._id, role: buyer.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, buyer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Get all buyers with search and pagination
exports.getAllBuyers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {
      role: 'user',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };

    const total = await User.countDocuments(query);
    const buyers = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      buyers,
    });
  } catch (err) {
    console.error('Fetch Buyers Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
};

// 📊 Dashboard Summary for Buyers
exports.getBuyerSummary = async (req, res) => {
  try {
    const totalBuyers = await User.countDocuments({ role: 'user' });
    const verifiedBuyers = await User.countDocuments({ role: 'user', isEmailVerified: true });
    const unverifiedBuyers = totalBuyers - verifiedBuyers;

    res.status(200).json({
      totalBuyers,
      verifiedBuyers,
      unverifiedBuyers,
      verificationRate: totalBuyers > 0
        ? ((verifiedBuyers / totalBuyers) * 100).toFixed(1) + '%'
        : '0%',
    });
  } catch (err) {
    console.error('Summary Error:', err.message);
    res.status(500).json({ error: 'Failed to get summary' });
  }
};

// 🗑️ Delete a buyer account by ID
exports.deleteBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBuyer = await User.findOneAndDelete({ _id: id, role: 'user' });

    if (!deletedBuyer) {
      return res.status(404).json({ msg: 'Buyer not found or already deleted' });
    }

    res.status(200).json({ msg: 'Buyer account deleted successfully' });
  } catch (err) {
    console.error('Delete Buyer Error:', err.message);
    res.status(500).json({ error: 'Failed to delete buyer' });
  }
};

// 👤 Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, gender, address, city, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, gender, address, city, phone },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔐 Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ⭐️ Toggle Wishlist
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ wishlist: user.wishlist, message: index === -1 ? 'Added to wishlist' : 'Removed from wishlist' });
  } catch (err) {
    console.error('Wishlist Error:', err.message);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
};

// ⭐️ Get Wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user.wishlist || []);
  } catch (err) {
    console.error('Get Wishlist Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};
