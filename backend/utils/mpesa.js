const axios = require('axios');
const base64 = require('base-64');

// ✅ In-memory token cache — Safaricom tokens are valid for 3600s (1 hour)
let _cachedToken = null;
let _tokenExpiresAt = 0;
let _credentialSnapshot = null; // Detects .env credential changes at runtime

const _fetchFreshToken = async () => {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  const auth = base64.encode(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);

  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  _cachedToken = res.data.access_token;
  const expiresIn = (res.data.expires_in || 3600) * 1000;
  _tokenExpiresAt = Date.now() + expiresIn;
  _credentialSnapshot = `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`;

  return _cachedToken;
};

exports.getAccessToken = async () => {
  const now = Date.now();
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  const currentCredentials = `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`;

  // Bust cache if credentials changed in .env
  const credentialsChanged = _credentialSnapshot && _credentialSnapshot !== currentCredentials;
  if (credentialsChanged) {
    console.log('🔄 M-Pesa credentials changed — refreshing access token');
    _cachedToken = null;
    _tokenExpiresAt = 0;
  }

  // Return cached token if still valid (with 60s buffer before expiry)
  if (_cachedToken && now < _tokenExpiresAt - 60000) {
    return _cachedToken;
  }

  return _fetchFreshToken();
};

// Call this when a 404.001.03 "Invalid Access Token" error is received
exports.invalidateTokenCache = () => {
  console.log('🗑️ M-Pesa token cache invalidated — will fetch fresh token on next request');
  _cachedToken = null;
  _tokenExpiresAt = 0;
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
