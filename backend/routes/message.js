const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth, adminOnly } = require('../middlewares/auth');

// Public route to submit a message
router.post('/', messageController.submitMessage);

// Admin-only: Get all submitted messages
router.get('/', auth, adminOnly, messageController.getMessages);

module.exports = router;
