const otpStore = new Map();

// Clean up expired OTPs every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, item] of otpStore.entries()) {
    if (now > item.expiresAt) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

/**
 * Validates if an email address belongs to Ramaiah Institute of Technology (@msrit.edu)
 * @param {string} email
 * @returns {boolean}
 */
const isMsritEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith('@msrit.edu');
};

/**
 * Generates a 6-digit OTP code for a student USN / email
 * @param {string} identifier (USN or email)
 * @param {string} email
 * @returns {{ otp: string, expiresAt: number, maskedEmail: string }}
 */
const generateOtp = (identifier, email) => {
  const key = identifier.trim().toUpperCase();
  // 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  otpStore.set(key, {
    otp: code,
    email: email.trim().toLowerCase(),
    expiresAt,
    attempts: 0
  });

  // Mask email for privacy (e.g., 1m******70@msrit.edu or m******k@msrit.edu)
  const parts = email.split('@');
  const userPart = parts[0];
  const domain = parts[1] || 'msrit.edu';
  let maskedUser = userPart;
  if (userPart.length > 3) {
    maskedUser = userPart.substring(0, 2) + '*'.repeat(Math.max(3, userPart.length - 4)) + userPart.slice(-2);
  } else {
    maskedUser = userPart[0] + '**';
  }
  const maskedEmail = `${maskedUser}@${domain}`;

  console.log(`[MSRIT Auth] 📧 Generated Login OTP for ${email} (${key}): [${code}] (Expires in 10 mins)`);

  return {
    otp: code,
    expiresAt,
    maskedEmail
  };
};

/**
 * Verifies the 6-digit OTP entered by the student
 * @param {string} identifier (USN or email)
 * @param {string} enteredOtp
 * @returns {{ valid: boolean, message?: string }}
 */
const verifyOtp = (identifier, enteredOtp) => {
  if (!identifier || !enteredOtp) {
    return { valid: false, message: 'USN and 6-digit OTP are required.' };
  }

  const key = identifier.trim().toUpperCase();
  const record = otpStore.get(key);

  if (!record) {
    return {
      valid: false,
      message: 'No active OTP found or it has expired. Please click "Resend OTP".'
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return {
      valid: false,
      message: 'OTP has expired (10 min limit). Please request a new code.'
    };
  }

  if (record.attempts >= 5) {
    otpStore.delete(key);
    return {
      valid: false,
      message: 'Too many invalid attempts. For security, please request a new OTP.'
    };
  }

  const cleanEntered = enteredOtp.toString().trim();
  if (cleanEntered !== record.otp) {
    record.attempts += 1;
    return {
      valid: false,
      message: `Invalid OTP code. ${5 - record.attempts} attempt(s) remaining.`
    };
  }

  // OTP successfully verified -> consume it
  otpStore.delete(key);
  return { valid: true };
};

/**
 * Peek at current OTP for dev/eval presentation mode
 */
const peekOtp = (identifier) => {
  const key = (identifier || '').trim().toUpperCase();
  const record = otpStore.get(key);
  return record ? record.otp : null;
};

module.exports = {
  isMsritEmail,
  generateOtp,
  verifyOtp,
  peekOtp
};

