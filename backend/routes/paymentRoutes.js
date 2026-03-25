const express = require('express');
const router = express.Router();

const {
  initiateStkPush,
  handleStkCallback,
  checkStkStatusQuery, // <-- NEW
  checkPaymentStatus,
  recordCashSale,
  getAllSales,
  getMySales,
  updateDeliveryStatus,
} = require('../controllers/paymentController');

const { auth: verifyToken } = require('../middlewares/auth');

router.get('/ping', (req, res) => res.json({ message: 'Payment Router OK' }));

// M-Pesa STK Push (Client initiates payment)
router.post('/stk', verifyToken, initiateStkPush);

// M-Pesa Active Polling Endpoint (Direct Query to Safaricom)
router.get('/stk/:checkoutRequestId/status', verifyToken, checkStkStatusQuery);

// M-Pesa STK Callback (Safaricom sends result)
router.post('/stk/callback', handleStkCallback);

// Check status of payment(s)
router.get('/status', checkPaymentStatus);

// Record a manual in-shop/cash sale
router.post('/cash', verifyToken, recordCashSale);
router.post('/cash-sale', verifyToken, recordCashSale); // Alias for frontend
router.get('/all', getAllSales); // ✅ Admin fetch all sales
router.get('/my', verifyToken, getMySales); // ✅ Buyer fetch their own sales
router.patch('/:id/delivery-status', verifyToken, updateDeliveryStatus); // ✅ Buyer update their delivery status

module.exports = router;
