const axios = require('axios');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { getAccessToken, getTimestamp, generatePassword } = require('../utils/mpesa');

const businessShortCode = process.env.MPESA_PAYBILL;
const passkey = process.env.MPESA_PASSKEY;
const callbackURL = `${process.env.MPESA_CALLBACK_URL}/api/payments/stk/callback`;

// 📦 STK INITIATION
exports.initiateStkPush = async (req, res) => {
  try {
    let { phoneNumber, amount, items, buyerName, fulfillmentType, deliveryDetails } = req.body;
    const sellerName = req.user?.name || 'Unknown';
    const buyerEmail = req.user?.email;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    if (!businessShortCode || !passkey) {
      console.error('❌ M-Pesa credentials missing in .env');
      return res.status(500).json({ message: 'Payment system configuration error' });
    }

    // Pick the first item for description or summarize
    const firstProductName = items[0].productName || 'Jewellery Pieces';
    
    // Safaricom WAF requires strict alphanumeric strings without special characters to avoid 'Threat Detected'
    const transactionDesc = 'AurumVaultOrder';

    // ✅ Normalize phone number
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.replace(/^0/, '254');
    } else if (!phoneNumber.startsWith('254')) {
      if (!phoneNumber.startsWith('+254')) {
         return res.status(400).json({ message: 'Invalid phone number format. Use 07... or 254...' });
      }
      phoneNumber = phoneNumber.replace('+', '');
    }

    // 🔒 Duplicate Prevention: Check for pending transactions in the last 60 seconds
    const existingPending = await Sale.findOne({
      phoneNumber,
      status: 'Pending',
      createdAt: { $gte: new Date(Date.now() - 60000) }
    });

    if (existingPending) {
      return res.status(400).json({ 
        message: 'You have a pending transaction processing on this phone number. Please check your phone for the M-Pesa prompt, or wait a minute before trying again.' 
      });
    }

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(businessShortCode, passkey, timestamp);

    // Normalize callback URL (strip trailing slash from base if present)
    const baseCallback = process.env.MPESA_CALLBACK_URL ? process.env.MPESA_CALLBACK_URL.replace(/\/$/, '') : '';
    const fullCallbackURL = `${baseCallback}/api/payments/stk/callback`;

    console.log('🚀 Initiating STK Push for:', phoneNumber, 'Amount:', amount);
    
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: fullCallbackURL,
        AccountReference: 'AurumVault',
        TransactionDesc: transactionDesc,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const checkoutRequestID = response.data.CheckoutRequestID;

    // ✅ Granular try-catch for DB record creation
    try {
      await Sale.create({
        items,
        productName: items.length > 1 ? `${firstProductName} +${items.length - 1}` : firstProductName,
        productId: items[0].productId,
        buyerName,
        buyerEmail,
        phoneNumber,
        sellerName,
        amount,
        status: 'Pending',
        paymentMethod: 'mpesa',
        transactionId: checkoutRequestID,
        fulfillmentType: fulfillmentType || 'delivery',
        deliveryDetails,
        deliveryStatus: fulfillmentType === 'pickup' ? 'Processing' : 'Pending',
      });
    } catch (dbErr) {
      console.error('❌ Sale.create failed:', dbErr.message, dbErr.stack);
      return res.status(500).json({ 
        message: 'STK push failed - DB Error', 
        error: dbErr.message,
        hint: 'Check if product IDs are valid MongoDB ObjectIds'
      });
    }

    res.status(200).json({ 
      message: 'STK push initiated. Please check your phone.',
      checkoutRequestID 
    });
  } catch (err) {
    const errorDetail = err?.response?.data || err.message || err;
    console.error('❌ STK error detail:', errorDetail);
    res.status(500).json({ 
      message: 'STK push failed. Check console for details.', 
      error: errorDetail 
    });
  }
};


const emailService = require('../utils/emailService');

// 📥 STK CALLBACK
exports.handleStkCallback = async (req, res) => {
  try {
    const callback = req.body.Body?.stkCallback;
    if (!callback) {
      console.warn('⚠️ No stkCallback in body:', JSON.stringify(req.body));
      return res.status(400).json({ message: 'Malformed callback' });
    }

    const metadata = callback.CallbackMetadata;
    const phoneRaw = metadata?.Item.find(i => i.Name === 'PhoneNumber')?.Value;
    const receipt = metadata?.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata?.Item.find(i => i.Name === 'Amount')?.Value;
    const transactionId = callback.CheckoutRequestID;
    const statusCode = callback.ResultCode;

    console.log('🔔 STK Callback Received:', {
      transactionId,
      phoneRaw,
      amount,
      statusCode,
      receipt,
    });

    const phoneNumber = phoneRaw?.toString();

    // ✅ Update Sale status
    const status = statusCode === 0 ? 'Success' : 'Failed';
    const updated = await Sale.findOneAndUpdate(
      { transactionId, status: 'Pending' },
      { 
        receiptNumber: receipt, 
        status,
        deliveryStatus: status === 'Failed' ? 'Failed' : undefined // Sync delivery with payment failure
      },
      { new: true }
    );

    // If it was already picked up as Processing, and it's Success, keep Processing.
    // If it was Pending for delivery and it's Success, keep Pending. The $set above correctly ignores undefined.

    if (updated && status === 'Success') {
      console.log('✅ Sale success, triggering email...');
      if (updated.buyerEmail) {
        await emailService.sendOrderConfirmation(updated.buyerEmail, updated);
      }
    }

    res.status(200).json({ message: 'Callback processed' });
  } catch (err) {
    console.error('❌ Callback Handling Error:', err);
    res.status(500).json({ message: 'Callback processing failed' });
  }
};

// 🔄 ACTIVE POLLING ENDPOINT (Direct SafariCom STK Query)
exports.checkStkStatusQuery = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    // First, check local DB
    const sale = await Sale.findOne({ transactionId: checkoutRequestId });
    if (!sale) {
      return res.status(404).json({ message: 'Transaction not found in database', status: 'Failed' });
    }

    // If already resolved by webhook, just return the status
    if (sale.status !== 'Pending') {
      return res.status(200).json({ status: sale.status, receipt: sale.receiptNumber });
    }

    // Still pending, ping Safaricom STK Push Query API
    if (!businessShortCode || !passkey) return res.status(200).json({ status: 'Pending' });

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(businessShortCode, passkey, timestamp);

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const data = response.data;
    const resultCode = data.ResultCode;
    const resultDesc = data.ResultDesc;

    if (resultCode === '0') {
      // ✅ Success
      sale.status = 'Success';
      const receiptMatch = resultDesc.match(/(?<=\b)[A-Z0-9]{10}(?=\b)/); // rudimentary extraction if receipt not in query body
      if (receiptMatch) sale.receiptNumber = receiptMatch[0];
      
      await sale.save();
      
      console.log(`✅ STK Query Resolved Success for ${checkoutRequestId}, triggering email...`);
      if (sale.buyerEmail) await emailService.sendOrderConfirmation(sale.buyerEmail, sale);
      
      return res.status(200).json({ status: 'Success', receipt: sale.receiptNumber });
    } else {
      // ❌ Failed (Cancelled, Timeout, Insufficient Funds, etc)
      sale.status = 'Failed';
      sale.deliveryStatus = 'Failed';
      await sale.save();
      return res.status(200).json({ status: 'Failed', reason: resultDesc });
    }

  } catch (err) {
    const errorBody = err.response?.data;
    if (errorBody && errorBody.errorCode === '500.001.1001') {
      // "The transaction is being processed" -> This is a normal Safaricom response for still pending
      return res.status(200).json({ status: 'Pending' });
    }
    
    // Safaricom query errors natively log but we just tell UI it's still pending
    console.error('⚠️ STK Status Query Error:', errorBody || err.message);
    res.status(200).json({ status: 'Pending' });
  }
};


// 💵 CASH SALE
exports.recordCashSale = async (req, res) => {
  try {
    const { productId, buyerName, amount } = req.body;
    const sellerName = req.user?.name || 'Unknown';

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Sale.create({
      productId,
      productName: product.name,
      buyerName,
      amount,
      status: 'Success',
      paymentMethod: 'cash',
      sellerName,
    });

    res.status(201).json({ message: 'Cash sale recorded successfully' });
  } catch (err) {
    console.error('❌ Cash sale error:', err.message);
    res.status(500).json({ message: 'Failed to record cash sale' });
  }
};


// 📊 FETCH PAYMENTS
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { phoneNumber, status } = req.query;
    let query = {};

    if (phoneNumber) {
      const normalizedPhone = phoneNumber.slice(-9); // Match last 9 digits
      query.phoneNumber = { $regex: `${normalizedPhone}$` };
    }

    if (status) {
      const validStatuses = ['Pending', 'Success', 'Failed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      query.status = status;
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 });

    if (!sales.length) {
      return res.status(404).json({ message: 'No payments found' });
    }

    res.status(200).json(
      sales.map(sale => ({
        status: sale.status,
        receipt: sale.receiptNumber,
        transactionId: sale.transactionId,
        productId: sale.productId,
        productName: sale.productName,
        amount: sale.amount,
        buyerName: sale.buyerName,
        phoneNumber: sale.phoneNumber,
        sellerName: sale.sellerName,
        paymentMethod: sale.paymentMethod,
        date: sale.createdAt,
      }))
    );
  } catch (err) {
    console.error('❌ Payment status check error:', err.message);
    res.status(500).json({ message: 'Failed to fetch payment(s)' });
  }
};

// GET /api/payments
exports.getAllSales = async (req, res) => {
  try {
    const {
      status,
      sellerName,
      productId,
      buyerName,
      phoneNumber,
      paymentMethod,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (sellerName) filter.sellerName = sellerName;
    if (productId) filter.productId = productId;
    if (buyerName) filter.buyerName = { $regex: buyerName, $options: 'i' };
    if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const skip = (page - 1) * limit;

    // Fetch paginated sales
    const sales = await Sale.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Total matching sales count
    const totalCount = await Sale.countDocuments(filter);

    // Aggregate stats for the filtered data
    const [totals] = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          successfulRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "Success"] }, "$amount", 0],
            },
          },
          successfulSalesCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Success"] }, 1, 0],
            },
          },
          failedSalesCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Failed"] }, 1, 0],
            },
          },
          pendingSalesCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      sales,
      pagination: {
        total: totalCount,
        page: Number(page),
        pages: Math.ceil(totalCount / limit),
      },
      totals: {
        totalRevenue: totals?.totalRevenue || 0,
        successfulRevenue: totals?.successfulRevenue || 0,
        successfulSalesCount: totals?.successfulSalesCount || 0,
        failedSalesCount: totals?.failedSalesCount || 0,
        pendingSalesCount: totals?.pendingSalesCount || 0,
      },
    });
  } catch (err) {
    console.error("Get all sales error:", err.message);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
};

// 🔐 GET MY SALES (Buyer only)
exports.getMySales = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // req.user from auth middleware
    const sales = await Sale.find({ 
      buyerEmail: user.email,
      status: 'Success' // 🔒 Exclude Pending and Failed from User Profile
    }).sort({ createdAt: -1 });

    res.status(200).json(sales);
  } catch (err) {
    console.error('❌ Get my sales error:', err.message);
    res.status(500).json({ message: 'Failed to fetch your orders' });
  }
};

// 📦 UPDATE DELIVERY STATUS (Mark as Received / Request Return)
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'Received', 'Returned'
    
    // Safety check: Ensure user owns the sale via strict email match
    const user = await require('../models/User').findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sale = await require('../models/Sale').findOne({ 
      _id: id,
      buyerEmail: user.email
    });

    if (!sale) return res.status(404).json({ message: 'Order not found or unauthorized' });

    sale.deliveryStatus = status;
    if (status === 'Returned') sale.isReturnRequested = true;
    await sale.save();

    res.status(200).json({ message: `Order status updated to ${status}`, sale });
  } catch (err) {
    console.error('❌ Update delivery status error:', err.message);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};
