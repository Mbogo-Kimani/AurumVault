const layout = require('./layout');

// Reusable UI Components
const titleSerif = (text) => `<h2 style="margin: 0 0 20px; font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: normal; color: #000000;">${text}</h2>`;

const paragraph = (text) => `<p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #333333;">${text}</p>`;

const button = (text, link) => `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
  <tr>
    <td align="center">
      <table border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" bgcolor="#000000" style="border-radius: 0;">
            <a href="${link}" target="_blank" style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; color: #ffffff; text-decoration: none; padding: 16px 32px; border: 1px solid #000000; display: inline-block; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">
              ${text}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

const dividerLine = () => `<div style="height: 1px; background-color: #E5E5E5; width: 100%; margin: 30px 0;"></div>`;

/* -------------------------------------------------------------------------- */
/*                               EMAIL TEMPLATES                              */
/* -------------------------------------------------------------------------- */

// 1. Welcome Email
exports.welcomeEmail = ({ userName }) => {
  const content = `
    ${titleSerif(`Welcome to the Private Vault, ${userName}.`)}
    ${paragraph('We are honored to have you join our exclusive inner circle. As a member of AurumVault, you now have privileged access to our curated collections of masterful craftsmanship, bespoke commissions, and private acquisitions.')}
    ${paragraph('Expect uncompromising luxury, timeless elegance, and exceptional service.')}
    ${button('Explore The Collections', 'https://aurumvault.vercel.app/shop')}
  `;
  return layout('Welcome to AurumVault', content);
};

// 1.5 Newsletter Subscription Welcome Email
exports.subscriptionWelcomeEmail = () => {
  const content = `
    ${titleSerif('Welcome to the Vault.')}
    ${paragraph('Thank you for subscribing to our exclusive newsletter. As a member of our inner circle, you will receive privileged early access to our private collections, bespoke commissions, and insider vault dispatches.')}
    ${paragraph('Expect uncompromising luxury delivered straight to your inbox.')}
    ${button('View Latest Arrivals', 'https://aurumvault.vercel.app/shop')}
  `;
  return layout('AurumVault Inner Circle', content);
};

// 2. OTP Verification Email
exports.otpEmail = ({ userName, otp, context = 'verification' }) => {
  const content = `
    ${titleSerif(`Your Security Code`)}
    ${paragraph(`Dear ${userName},<br>Please use the following single-use code to complete your ${context === 'reset' ? 'password reset' : 'account verification'}.`)}
    
    <div style="margin: 40px 0; text-align: center;">
      <span style="font-family: 'Times New Roman', Times, serif; font-size: 40px; font-weight: normal; letter-spacing: 0.2em; color: #000000; border-bottom: 2px solid #C9A14A; padding-bottom: 10px;">
        ${otp}
      </span>
    </div>

    ${paragraph('This code will expire in 10 minutes. For your security, please do not share this code with anyone. If you did not request this, you may safely ignore this email.')}
  `;
  return layout('AurumVault Security Code', content);
};

// 3. Order Confirmation Email
exports.orderConfirmationEmail = ({ userName, orderId, orderItems, totalAmount, isPickup, deliveryDetails }) => {
  let itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #E5E5E5;">
        <p style="margin: 0; font-size: 14px; font-family: 'Times New Roman', Times, serif; color: #000000;">${item.name}</p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Qty: ${item.quantity}</p>
      </td>
      <td align="right" style="padding: 15px 0; border-bottom: 1px solid #E5E5E5;">
        <p style="margin: 0; font-size: 14px; color: #000000;">KES ${(item.price * item.quantity).toLocaleString()}</p>
      </td>
    </tr>
  `).join('');

  const deliveryInfo = isPickup ? `
    <div style="border-left: 2px solid #C9A14A; padding-left: 20px; margin-bottom: 30px;">
      <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; margin: 0 0 5px; color: #000000; letter-spacing: 0.1em;">Collection Point</p>
      <p style="margin: 0; font-size: 14px; color: #333333;">AurumVault Private Atelier<br>123 Luxury Square, Nairobi</p>
      <p style="margin: 10px 0 0; font-size: 12px; color: #666666;">Hours: Mon-Sat, 10:00 AM - 6:00 PM</p>
    </div>
  ` : `
    <div style="border-left: 2px solid #C9A14A; padding-left: 20px; margin-bottom: 30px;">
      <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; margin: 0 0 5px; color: #000000; letter-spacing: 0.1em;">Delivery Destination</p>
      <p style="margin: 0; font-size: 14px; color: #333333;">${deliveryDetails?.address}, ${deliveryDetails?.city}</p>
      ${deliveryDetails?.note ? `<p style="margin: 10px 0 0; font-size: 12px; color: #666666; font-style: italic;">Note: ${deliveryDetails.note}</p>` : ''}
    </div>
  `;

  const content = `
    ${titleSerif(`Acquisition Confirmed.`)}
    ${paragraph(`Thank you for your acquisition, ${userName}. Your order has been successfully recorded and is now being secured in our vaults.`)}
    
    <div style="background-color: #f9f9f9; padding: 30px; margin: 30px 0;">
      <p style="margin: 0 0 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">Order Summary &nbsp;|&nbsp; #${orderId.slice(-6).toUpperCase()}</p>
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${itemsHtml}
        <tr>
          <td style="padding: 20px 0 0;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #000000;">Total Investment</p>
          </td>
          <td align="right" style="padding: 20px 0 0;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000000;">KES ${totalAmount.toLocaleString()}</p>
          </td>
        </tr>
      </table>
    </div>

    ${deliveryInfo}
    ${button('Access Your Profile', 'https://aurumvault.vercel.app/profile')}
  `;
  return layout(`Order Confirmation #${orderId.slice(-6).toUpperCase()}`, content);
};

// 4. Payment Confirmation Email
exports.paymentConfirmationEmail = ({ userName, amount, transactionRef, orderId }) => {
  const content = `
    ${titleSerif('Payment Successfully Secured.')}
    ${paragraph(`Dear ${userName},<br>We have successfully received your payment. Your acquisition is now proceeding to the final fulfillment stage.`)}
    
    <div style="border: 1px solid #E5E5E5; padding: 30px; margin: 30px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 15px;"><p style="margin: 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Transaction Ref</p></td>
          <td align="right" style="padding-bottom: 15px;"><p style="margin: 0; font-size: 14px; font-weight: bold; color: #000000;">${transactionRef}</p></td>
        </tr>
        <tr>
          <td style="padding-bottom: 15px;"><p style="margin: 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Order Number</p></td>
          <td align="right" style="padding-bottom: 15px;"><p style="margin: 0; font-size: 14px; color: #000000;">#${orderId.slice(-6).toUpperCase()}</p></td>
        </tr>
        <tr>
          <td><p style="margin: 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.05em;">Amount Settled</p></td>
          <td align="right"><p style="margin: 0; font-size: 14px; font-weight: bold; color: #000000;">KES ${amount.toLocaleString()}</p></td>
        </tr>
      </table>
    </div>

    ${button('View Order Details', 'https://aurumvault.vercel.app/profile')}
  `;
  return layout('Payment Remittance Notice', content);
};

// 5. Payment Failed / Pending Email
exports.paymentFailedEmail = ({ userName, orderId }) => {
  const content = `
    ${titleSerif('Payment Processing Issue.')}
    ${paragraph(`Dear ${userName},<br>We encountered a disruption while securely processing the payment for your order <b>#${orderId.slice(-6).toUpperCase()}</b>.`)}
    ${paragraph('Your selection remains reserved in our vault. Please attempt the transaction again or contact your financial provider if the issue persists.')}
    
    ${button('Retry Transaction', 'https://aurumvault.vercel.app/profile')}
    ${dividerLine()}
    <p style="margin: 0; font-size: 12px; color: #666666; line-height: 1.5;">If you require immediate assistance, our concierge team is standing by to resolve this anomaly discretely.</p>
  `;
  return layout('Payment Processing Disruption', content);
};

// 6. Shipping / Order Status Email
exports.shippingStatusEmail = ({ userName, orderId, status, trackingLink }) => {
  const content = `
    ${titleSerif(`Acquisition Dispatch: ${status}`)}
    ${paragraph(`Dear ${userName},<br>We are pleased to inform you that the status of your order <b>#${orderId.slice(-6).toUpperCase()}</b> has been exclusively updated to: <span style="font-weight: bold; color: #C9A14A; text-transform: uppercase;">${status}</span>.`)}
    
    ${trackingLink ? button('Track Secure Dispatch', trackingLink) : ''}
    
    ${paragraph('Our secure logistics team is handling your pieces with the utmost discretion and care. You will be notified the moment further progression occurs.')}
  `;
  return layout(`Vault Dispatch Update - ${status}`, content);
};

// 7. Contact Form Acknowledgment
exports.contactAcknowledgmentEmail = ({ userName, expectedResponseTime }) => {
  const content = `
    ${titleSerif('Inquiry Received.')}
    ${paragraph(`Dear ${userName},<br>Your correspondence has been securely transmitted to the AurumVault concierge team.`)}
    ${paragraph(`We operate with strict dedication to our clients. A specialist will personally review your inquiry and respond within ${expectedResponseTime || '24 hours'}.`)}
    ${paragraph('We appreciate your distinguished patience.')}
  `;
  return layout('AurumVault Concierge Acknowledgment', content);
};

// 8. Quote Request Confirmation (RFQ)
exports.quoteConfirmationEmail = ({ userName, summary }) => {
  const content = `
    ${titleSerif('Bespoke Commission Received.')}
    ${paragraph(`Dear ${userName},<br>Your request for a bespoke commission has been securely registered with our master artisans.`)}
    
    <div style="background-color: #f9f9f9; padding: 25px; margin: 30px 0; border-left: 2px solid #C9A14A;">
      <p style="margin: 0 0 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #666666;">Requested Specifications</p>
      <p style="margin: 0; font-size: 14px; font-style: italic; color: #333333; line-height: 1.6;">"${summary}"</p>
    </div>

    ${paragraph('Crafting timeless legacies requires precision. Our lead atelier will review your exact specifications and contact you shortly with an exclusive consultation and confidential estimate.')}
  `;
  return layout('Bespoke Commission Receipt', content);
};
