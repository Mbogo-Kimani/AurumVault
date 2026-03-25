const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await resend.emails.send({
      from: 'Aurum Vault <onboarding@resend.dev>', // ✅ FIXED LINE
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;

