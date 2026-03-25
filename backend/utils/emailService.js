const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const { 
  welcomeEmail, 
  otpEmail, 
  orderConfirmationEmail, 
  paymentConfirmationEmail, 
  paymentFailedEmail, 
  shippingStatusEmail, 
  contactAcknowledgmentEmail, 
  quoteConfirmationEmail,
  subscriptionWelcomeEmail 
} = require('./emailTemplates/templates');

// Generic Email Sender
exports.sendEmail = async ({ to, subject, html, toName }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { name: process.env.SENDER_NAME || "AurumVault", email: process.env.SENDER_EMAIL };
    sendSmtpEmail.to = [{ email: to, name: toName || to }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${to}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send email via Brevo:', err.response?.text || err.message);
    return false;
  }
};

/* -------------------------------------------------------------------------- */
/*                           TRIGGER SERVICES                                 */
/* -------------------------------------------------------------------------- */

exports.sendWelcome = async (email, userName) => {
  const html = welcomeEmail({ userName });
  await exports.sendEmail({ to: email, toName: userName, subject: "Welcome to AurumVault", html });
};

exports.sendSubscriptionWelcome = async (email) => {
  const html = subscriptionWelcomeEmail();
  await exports.sendEmail({ to: email, toName: 'Distinguished Collector', subject: "Welcome to the AurumVault Inner Circle", html });
};

exports.sendOtp = async (email, userName, otp, context) => {
  const html = otpEmail({ userName, otp, context });
  await exports.sendEmail({ to: email, toName: userName, subject: "Your Security Code", html });
};

exports.sendOrderConfirmation = async (email, sale) => {
  const subject = sale.fulfillmentType === 'pickup' 
    ? `Private Collection Secured - Order #${sale.transactionId.slice(-6).toUpperCase()}`
    : `Vault Dispatch Initiated - Order #${sale.transactionId.slice(-6).toUpperCase()}`;

  const html = orderConfirmationEmail({
    userName: sale.buyerName,
    orderId: sale.transactionId,
    orderItems: sale.products,
    totalAmount: sale.amount,
    isPickup: sale.fulfillmentType === 'pickup',
    deliveryDetails: sale.deliveryDetails
  });

  await exports.sendEmail({ to: email, toName: sale.buyerName, subject, html });
};

exports.sendPaymentConfirmation = async (email, userName, amount, transactionRef, orderId) => {
  const html = paymentConfirmationEmail({ userName, amount, transactionRef, orderId });
  await exports.sendEmail({ to: email, toName: userName, subject: "Payment Successfully Secured", html });
};

exports.sendPaymentFailed = async (email, userName, orderId) => {
  const html = paymentFailedEmail({ userName, orderId });
  await exports.sendEmail({ to: email, toName: userName, subject: "Payment Processing Issue", html });
};

exports.sendShippingStatus = async (email, userName, orderId, status, trackingLink) => {
  const html = shippingStatusEmail({ userName, orderId, status, trackingLink });
  await exports.sendEmail({ to: email, toName: userName, subject: `Vault Dispatch Update - ${status}`, html });
};

exports.sendContactAcknowledgment = async (email, userName) => {
  const html = contactAcknowledgmentEmail({ userName, expectedResponseTime: '24 hours' });
  await exports.sendEmail({ to: email, toName: userName, subject: "Inquiry Received", html });
};

exports.sendQuoteConfirmation = async (email, userName, summary) => {
  const html = quoteConfirmationEmail({ userName, summary });
  await exports.sendEmail({ to: email, toName: userName, subject: "Bespoke Commission Received", html });
};
