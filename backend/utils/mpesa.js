const axios = require('axios');
const base64 = require('base-64');

exports.getAccessToken = async () => {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  const auth = base64.encode(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);

  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return res.data.access_token;
};

exports.getTimestamp = () => {
  const date = new Date();
  return date
    .toISOString()
    .replace(/[-T:Z.]/g, '')
    .substring(0, 14);
};

exports.generatePassword = (shortCode, passkey, timestamp) => {
  return base64.encode(shortCode + passkey + timestamp);
};
