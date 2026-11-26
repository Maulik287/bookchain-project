const nodemailer = require('nodemailer');

let smtpTransporter = null;
let etherealTransporter = null;

const buildOtpHtml = (toEmail, otp, studentName) => `
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
      You requested a verification code to sign in to the BookChain Portal with your official email (<strong>${toEmail}</strong>).
    </div>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="expiry">Valid for 10 minutes. Do not share this code.</div>
    </div>
    <div class="message">
      Please enter this 6-digit code on the BookChain website to complete your verification.
    </div>
    <div class="footer">
      Ramaiah Institute of Technology, Bangalore • BookChain Academic Exchange
    </div>
  </div>
</body>
</html>
`;

// Tier 1A: Brevo HTTP API (Port 443 HTTPS — works 100% on Render Free Tier, 300 real emails/day free)
const sendViaBrevo = async (toEmail, otp, studentName, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER || 'noreply@bookchain.app';
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey.trim(),
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'BookChain MSRIT', email: senderEmail.trim() },
      to: [{ email: toEmail, name: studentName }],
      subject: `Your BookChain MSRIT Verification Code: ${otp}`,
      htmlContent
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Brevo API error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }

  console.log(`[Email Service] 📧 Real email sent via Brevo HTTPS API to ${toEmail} (messageId: ${data.messageId})`);
  return {
    success: true,
    provider: 'brevo',
    messageId: data.messageId || null,
    previewUrl: null,
    isRealDelivery: true
  };
};

// Tier 1B: Resend HTTP API (Port 443 HTTPS — works 100% on Render Free Tier)
const sendViaResend = async (toEmail, otp, htmlContent) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const fromAddress = process.env.SENDER_EMAIL || 'BookChain MSRIT <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [toEmail],
      subject: `Your BookChain MSRIT Verification Code: ${otp}`,
      html: htmlContent
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend API error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }

  console.log(`[Email Service] 📧 Real email sent via Resend HTTPS API to ${toEmail} (id: ${data.id})`);
  return {
    success: true,
    provider: 'resend',
    messageId: data.id || null,
    previewUrl: null,
    isRealDelivery: true
  };
};

// Tier 2: SMTP / Gmail App Password (works locally & on hosts with open SMTP ports)
const getSmtpTransporter = () => {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);

  if (!user || !pass) return null;

  if (user.includes('@gmail.com') || !host) {
    smtpTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 8000,
      auth: { user, pass }
    });
  } else {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 8000,
      auth: { user, pass }
    });
  }

  console.log(`[Email Service] Live SMTP transporter configured with ${user}`);
  return smtpTransporter;
};

// Tier 3: Ethereal Dev Inbox fallback (gives clickable preview URL without leaking OTP on BookChain UI)
const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;
  const testAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    connectionTimeout: 6000,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  console.log(`[Email Service] Initialized Ethereal dev inbox for ${testAccount.user}`);
  return etherealTransporter;
};

/**
 * Sends a 6-digit verification OTP to the student's email.
 * Priority: Brevo HTTPS API -> Resend HTTPS API -> Gmail/SMTP -> Ethereal Dev Inbox
 */
const sendOtpEmail = async (toEmail, otp, studentName = 'Student') => {
  const htmlContent = buildOtpHtml(toEmail, otp, studentName);

  // 1. Try Brevo HTTPS API (Best for Render Free Tier)
  if (process.env.BREVO_API_KEY) {
    try {
      const result = await sendViaBrevo(toEmail, otp, studentName, htmlContent);
      if (result) return result;
    } catch (err) {
      console.error('[Email Service] Brevo failed:', err.message);
    }
  }

  // 2. Try Resend HTTPS API
  if (process.env.RESEND_API_KEY) {
    try {
      const result = await sendViaResend(toEmail, otp, htmlContent);
      if (result) return result;
    } catch (err) {
      console.error('[Email Service] Resend failed:', err.message);
    }
  }

  // 3. Try Gmail / SMTP
  const smtp = getSmtpTransporter();
  if (smtp) {
    try {
      const info = await smtp.sendMail({
        from: `"BookChain MSRIT" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `Your BookChain MSRIT Verification Code: ${otp}`,
        html: htmlContent
      });
      console.log(`[Email Service] 📧 Real email sent via SMTP to ${toEmail}`);
      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
        previewUrl: null,
        isRealDelivery: true
      };
    } catch (err) {
      console.error(`[Email Service] SMTP failed (Note: Render Free Tier blocks ports 465/587 — set BREVO_API_KEY for HTTPS delivery):`, err.message);
    }
  }

  // 4. Fallback to Ethereal Dev Inbox so user still gets a clickable email preview link
  try {
    const devMailer = await getEtherealTransporter();
    const info = await devMailer.sendMail({
      from: '"BookChain MSRIT" <auth@msrit.edu>',
      to: toEmail,
      subject: `Your BookChain MSRIT Verification Code: ${otp}`,
      html: htmlContent
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service] 🔗 Ethereal dev email ready: ${previewUrl}`);
    return {
      success: true,
      provider: 'ethereal',
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      isRealDelivery: false
    };
  } catch (err) {
    console.warn('[Email Service] Fallback mailer error:', err.message);
  }

  console.log(`[Email Service] (Simulated Delivery) Sent OTP to ${toEmail}: [${otp}]`);
  return { success: true, simulated: true, previewUrl: null, isRealDelivery: false };
};

module.exports = {
  sendOtpEmail
};
