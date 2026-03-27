const axios = require('axios');
const base64 = require('base-64');

// ✅ In-memory token cache — Safaricom tokens are valid for 3600s (1 hour)
let _cachedToken = null;
let _tokenExpiresAt = 0;

exports.getAccessToken = async () => {
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer before expiry)
  if (_cachedToken && now < _tokenExpiresAt - 60000) {
    return _cachedToken;
  }

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

  _cachedToken = res.data.access_token;
  // expires_in is in seconds; convert to ms epoch
  const expiresIn = (res.data.expires_in || 3600) * 1000;
  _tokenExpiresAt = now + expiresIn;

  return _cachedToken;
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
