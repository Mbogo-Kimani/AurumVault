const express = require('express');
const router = express.Router();
const { createQuote, getQuotes, updateQuote, deleteQuote } = require('../controllers/quoteController');
const { auth, adminOnly } = require('../middlewares/auth');

// Public route to create a quote
router.post('/', createQuote);

// Admin-only: Get, update, and delete quotes
router.get('/', auth, adminOnly, getQuotes);
router.put('/:id', auth, adminOnly, updateQuote);
router.delete('/:id', auth, adminOnly, deleteQuote);

module.exports = router;
