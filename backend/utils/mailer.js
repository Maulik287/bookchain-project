const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;

  if (user && pass) {
    if (user.includes('@gmail.com') || !host) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass }
      });
    }
    console.log(`[Email Service] Live SMTP transporter configured with ${user}`);
    return transporter;
  }

  // Fallback: Ethereal test inbox for localhost evaluation without setup
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[Email Service] Initialized dev mailer for ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.warn('[Email Service] Fallback mailer error:', err.message);
    return null;
  }
};

/**
 * Sends a 6-digit verification OTP to the student's @msrit.edu email
 * @param {string} toEmail - student's typed @msrit.edu email
 * @param {string} otp - 6-digit OTP code
 * @param {string} studentName - student's name
 */
const sendOtpEmail = async (toEmail, otp, studentName = 'Student') => {
  const mailOptions = {
    from: `"BookChain MSRIT" <${process.env.EMAIL_USER || 'auth@msrit.edu'}>`,
    to: toEmail,
    subject: `Your BookChain MSRIT Verification Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #131b2e; border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 800; color: #818cf8; margin: 0; }
          .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
          .greeting { font-size: 15px; color: #e2e8f0; margin-bottom: 16px; }
          .message { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: #090d16; border: 2px dashed #6366f1; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: #38bdf8; margin: 0; }
          .expiry { font-size: 12px; color: #f43f5e; margin-top: 8px; }
          .footer { font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">BookChain • MSRIT</h1>
            <div class="subtitle">Academic Peer-to-Peer Ownership Chain (Course 24CIE554)</div>
          </div>
          <div class="greeting">Hello <strong>${studentName}</strong>,</div>
          <div class="message">
            You requested a verification code to sign in to the BookChain Portal with your official Ramaiah Institute of Technology email (<strong>${toEmail}</strong>).
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">Valid for 10 minutes. Do not share this code.</div>
          </div>
          <div class="message">
            Please enter this 6-digit code on the BookChain website to complete your email verification and access your student dashboard.
          </div>
          <div class="footer">
            Ramaiah Institute of Technology, Bangalore • BookChain Academic Exchange
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const activeTransporter = await getTransporter();
    if (activeTransporter) {
      const info = await activeTransporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Service] 📧 Email successfully dispatched to ${toEmail}`);
      if (previewUrl) {
        console.log(`[Email Service] 🔗 View dispatched email in browser: ${previewUrl}`);
      }
      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: previewUrl || null,
        isRealDelivery: !previewUrl
      };
    }
  } catch (err) {
    console.error(`[Email Service] Failed to send email via SMTP to ${toEmail}:`, err.message);
  }

  console.log(`[Email Service] (Simulated Delivery) Sent OTP to ${toEmail}: [${otp}]`);
  return { success: true, simulated: true, previewUrl: null };
};

module.exports = {
  sendOtpEmail
};
