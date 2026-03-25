const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth, adminOnly } = require('../middlewares/auth');

// Public route to submit a message
router.post('/', messageController.submitMessage);

// Admin-only: Get all submitted messages
router.get('/', auth, adminOnly, messageController.getMessages);

// Admin-only: Update message status (mark as read)
router.put('/:id', auth, adminOnly, messageController.updateMessage);

// Admin-only: Delete a message
router.delete('/:id', auth, adminOnly, messageController.deleteMessage);

module.exports = router;
