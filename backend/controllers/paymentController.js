const axios = require('axios');
const Sale = require('../models/Sale');
const { getAccessToken, getTimestamp, generatePassword } = require('../utils/mpesa');

const businessShortCode = process.env.MPESA_PAYBILL;
const passkey = process.env.MPESA_PASSKEY;
const callbackURL = `${process.env.BASE_URL}/api/payments/stk-callback`;

exports.initiateStkPush = async (req, res) => {
  try {
    const { phoneNumber, amount, productId, buyerName } = req.body;

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(businessShortCode, passkey, timestamp);

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
        CallBackURL: callbackURL,
        AccountReference: 'AurumVault',
        TransactionDesc: `Payment for ${productId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Save as pending sale
    await Sale.create({ productId, phoneNumber, amount, buyerName });

    res.status(200).json({ message: 'STK push initiated. Please check your phone.' });
  } catch (err) {
  console.error('STK error:', err?.response?.data || err.message || err);
  res.status(500).json({ error: 'STK push failed. Try again.' });
  }
};

exports.handleStkCallback = async (req, res) => {
  try {
    const callback = req.body.Body.stkCallback;
    const metadata = callback.CallbackMetadata;

    const phoneNumber = metadata?.Item.find(i => i.Name === 'PhoneNumber')?.Value;
    const receipt = metadata?.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = metadata?.Item.find(i => i.Name === 'Amount')?.Value;

    if (callback.ResultCode === 0) {
      await Sale.findOneAndUpdate(
        { phoneNumber, amount, status: 'Pending' },
        {
          status: 'Success',
          transactionId: callback.CheckoutRequestID,
          receiptNumber: receipt,
        }
      );
    } else {
      await Sale.findOneAndUpdate(
        { phoneNumber, amount, status: 'Pending' },
        { status: 'Failed' }
      );
    }

    res.status(200).json({ message: 'Callback received' });
  } catch (err) {
    console.error('Callback error:', err.message);
    res.status(500).json({ error: 'Callback processing failed' });
  }
};
