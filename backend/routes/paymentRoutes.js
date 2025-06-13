const express = require('express');
const router = express.Router();
const { initiateStkPush, handleStkCallback } = require('../controllers/paymentController');

router.post('/stk', initiateStkPush);
router.post('/stk/callback', handleStkCallback);

module.exports = router;
