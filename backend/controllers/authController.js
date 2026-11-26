const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/storage');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { generateCaptcha, verifyCaptcha } = require('../utils/captcha');
const { isMsritEmail, generateOtp, verifyOtp, peekOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');

// In-memory store for pending registrations awaiting email OTP verification
const pendingRegistrations = new Map();

// Cleanup expired pending registrations
const regCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, item] of pendingRegistrations.entries()) {
    if (now > item.expiresAt) {
      pendingRegistrations.delete(key);
    }
  }
}, 5 * 60 * 1000);

if (regCleanupTimer && typeof regCleanupTimer.unref === 'function') {
  regCleanupTimer.unref();
}

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// Normalize DOB to DD-MM-YYYY format
const normalizeDob = (val) => {
  if (!val) return '';
  const clean = val.trim();
  if (/^\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}$/.test(clean)) {
    const parts = clean.split(/[-\/.]/);
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${d}-${m}-${y}`;
  }
  if (/^\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4}$/.test(clean)) {
    const parts = clean.split(/[-\/.]/);
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${d}-${m}-${y}`;
  }
  return clean;
};

// Helper: Ensure student email is an @msrit.edu email
const ensureMsritEmail = (user, newEmail = null) => {
  if (newEmail && isMsritEmail(newEmail)) {
    user.email = newEmail.trim().toLowerCase();
    store.save();
    return user.email;
  }
  if (!user.email || !isMsritEmail(user.email)) {
    user.email = `${user.usn.toLowerCase()}@msrit.edu`;
    store.save();
  }
  return user.email;
};

// @desc Generate new visual CAPTCHA for student login/register
// @route GET /api/auth/captcha
const getCaptcha = (req, res) => {
  try {
    const captcha = generateCaptcha();
    return res.json({
      success: true,
      captchaId: captcha.captchaId,
      captchaSvg: captcha.captchaSvg,
      previewText: captcha.previewText
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate CAPTCHA: ' + err.message
    });
  }
};

// @desc Step 1 Registration: Validate form (No USN required) & send 6-digit OTP to @msrit.edu email
// @route POST /api/auth/register-step1
const registerStep1 = async (req, res) => {
  try {
    let { name, email, usn, dob, department, semester, phone, captchaId, captchaInput } = req.body;

    if (!name || !email || !dob) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Full Name, Official Email (@msrit.edu), and Date of Birth (DOB).'
      });
    }

    // Verify CAPTCHA
    if (!verifyCaptcha(captchaId, captchaInput)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired CAPTCHA code. Please click refresh and try again.'
      });
    }

    email = email.trim().toLowerCase();

    // STRICT CHECK: Email MUST end with @msrit.edu
    if (!isMsritEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Registration requires an official college email ending with @msrit.edu (e.g. student@msrit.edu).'
      });
    }

    if (store.findUserByEmail(email)) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${email}' already exists.`
      });
    }

    const cleanUsn = usn ? usn.trim().toUpperCase() : '';
    if (cleanUsn && store.findUserByUsn(cleanUsn)) {
      return res.status(400).json({
        success: false,
        message: `A student account with USN '${cleanUsn}' is already registered.`
      });
    }

    const formattedDob = normalizeDob(dob);
    const key = email; // Key pending registration & OTP by email (No USN required)

    // Generate 6-digit OTP
    const { otp, expiresAt, maskedEmail } = generateOtp(key, email);

    // Save pending registration until email is verified
    pendingRegistrations.set(key, {
      name: name.trim(),
      email,
      usn: cleanUsn,
      role: 'student',
      dob: formattedDob,
      department: department || 'Computer Science & Engineering',
      semester: semester || '4th Sem',
      phone: phone || '+91 98765 43210',
      expiresAt
    });

    // Send OTP email
    const mailResult = await sendOtpEmail(email, otp, name.trim());

    return res.json({
      success: true,
      requireOtp: true,
      step: 2,
      message: `Verification code sent to ${email}! Please check your email inbox and enter the 6-digit OTP to complete registration.`,
      usn: cleanUsn,
      email,
      maskedEmail,
      expiresAt,
      isRealDelivery: !mailResult?.previewUrl,
      previewUrl: mailResult?.previewUrl || null
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Registration Step 1 failed: ' + err.message
    });
  }
};

// @desc Step 2 Registration: Verify OTP and create student account
// @route POST /api/auth/register-verify-otp
const registerVerifyOtp = (req, res) => {
  try {
    const { email, usn, otp } = req.body;
    const key = (email || usn || '').trim().toLowerCase();

    if (!key || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and the 6-digit OTP received on your @msrit.edu email.'
      });
    }

    const pending = pendingRegistrations.get(key) || pendingRegistrations.get(key.toUpperCase());
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found or session expired. Please fill the registration form again.'
      });
    }

    const lookupKey = pendingRegistrations.has(key) ? key : key.toUpperCase();

    // Verify OTP
    const verification = verifyOtp(lookupKey, otp);
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: verification.message || 'Invalid or expired OTP code.'
      });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(pending.dob, salt);

    // Create user in database (isDemo: false)
    const newUser = store.createUser({
      name: pending.name,
      email: pending.email,
      usn: pending.usn || '',
      role: 'student',
      dob: pending.dob,
      password: hashedPassword,
      department: pending.department,
      semester: pending.semester,
      phone: pending.phone
    });

    // Remove from pending store
    pendingRegistrations.delete(lookupKey);

    const token = generateToken(newUser._id);
    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: `Registration and email verification complete! Welcome to BookChain, ${newUser.name}.`,
      token,
      user: userSafe
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Registration verification failed: ' + err.message
    });
  }
};

// Unified register endpoint
const register = (req, res) => {
  if (req.body.otp) {
    return registerVerifyOtp(req, res);
  }
  return registerStep1(req, res);
};

// @desc Step 1 Login: Validate Email (No USN required), DOB, CAPTCHA -> Return Step 2 for Email OTP
// @route POST /api/auth/login-step1
const loginStep1 = (req, res) => {
  try {
    const { name, email, usn, identifier, dob, password, captchaId, captchaInput } = req.body;

    const loginId = (email || identifier || usn || '').trim();
    const studentDob = (dob || password || '').trim();
    const studentName = (name || '').trim();

    if (!loginId || !studentDob) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Official Email (@msrit.edu) and Date of Birth (DOB).'
      });
    }

    // Verify CAPTCHA
    if (!verifyCaptcha(captchaId, captchaInput)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired CAPTCHA code. Please click the refresh icon and re-enter.'
      });
    }

    // Find student by email first (No USN needed), fallback to USN if provided
    let user = store.findUserByEmail(loginId);
    if (!user) {
      user = store.findUserByUsn(loginId);
    }

    if (!user || user.role === 'admin') {
      return res.status(401).json({
        success: false,
        message: `No student account found for '${loginId}'. Please check your @msrit.edu email or register first.`
      });
    }

    // If student Name is provided, verify it matches
    if (studentName) {
      const inputName = studentName.toLowerCase();
      const registeredName = user.name.toLowerCase();
      const inputParts = inputName.split(/\s+/);
      const regParts = registeredName.split(/\s+/);
      const hasPartMatch = inputParts.some(p => p.length >= 3 && regParts.some(rp => rp.includes(p) || p.includes(rp)));

      if (!registeredName.includes(inputName) && !inputName.includes(registeredName) && !hasPartMatch) {
        return res.status(401).json({
          success: false,
          message: `The entered name '${studentName}' does not match registered records for '${user.email}' (${user.name}).`
        });
      }
    }

    // Check DOB matching
    const inputNorm = normalizeDob(studentDob);
    const userDobNorm = normalizeDob(user.dob);

    const isMatch = (userDobNorm && inputNorm === userDobNorm) ||
                    bcrypt.compareSync(studentDob, user.password) ||
                    bcrypt.compareSync(inputNorm, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect Date of Birth. Expected format: DD-MM-YYYY.'
      });
    }

    const defaultEmail = ensureMsritEmail(user);

    return res.json({
      success: true,
      step: 2,
      requireOtp: true,
      message: 'Step 1 verified! Please confirm your @msrit.edu email and click "Send OTP".',
      usn: user.usn || '',
      email: defaultEmail,
      name: user.name,
      suggestedEmail: defaultEmail
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Step 1 verification failed: ' + err.message
    });
  }
};

// @desc Admin Panel Login (Single secured Library Incharge account — No USN required)
// @route POST /api/auth/admin-login
const adminLogin = (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginId = (username || email || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Admin Username and Password.'
      });
    }

    const user = store.findUserByEmail(loginId);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const token = generateToken(user._id);
    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: `Welcome to the Admin Panel, ${user.name}!`,
      token,
      user: userSafe
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Admin login failed: ' + err.message
    });
  }
};

// @desc Step 2: Student enters their @msrit.edu email and clicks "Send OTP"
// @route POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { usn, email } = req.body;

    const studentUsn = (usn || '').trim();
    let studentEmail = (email || '').trim().toLowerCase();

    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please type your official college email address.'
      });
    }

    // STRICT CHECK: Email MUST end with @msrit.edu
    if (!isMsritEmail(studentEmail)) {
      return res.status(400).json({
        success: false,
        message: 'College email must end with @msrit.edu (e.g. 1ms24ci070@msrit.edu).'
      });
    }

    let user = store.findUserByEmail(studentEmail);
    if (!user && studentUsn) {
      user = store.findUserByUsn(studentUsn);
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found for email: ' + studentEmail
      });
    }

    // Ensure user has this valid @msrit.edu email
    ensureMsritEmail(user, studentEmail);

    // Generate 6-digit OTP keyed by email
    const { otp, expiresAt, maskedEmail } = generateOtp(studentEmail, studentEmail);

    // Dispatch real email with HTML template and OTP
    const mailResult = await sendOtpEmail(studentEmail, otp, user.name);

    return res.json({
      success: true,
      message: `Verification code dispatched to ${studentEmail}! Please check your email inbox and enter the 6-digit OTP below.`,
      usn: user.usn || '',
      email: studentEmail,
      maskedEmail,
      expiresAt,
      isRealDelivery: !mailResult?.previewUrl,
      previewUrl: mailResult?.previewUrl || null
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP: ' + err.message
    });
  }
};

// @desc Step 2 Login: Verify 6-digit Email OTP and Issue Auth Token
// @route POST /api/auth/verify-otp
const verifyLoginOtp = (req, res) => {
  try {
    const { usn, identifier, otp, email } = req.body;
    const studentEmail = (email || identifier || '').trim().toLowerCase();
    const studentUsn = (usn || '').trim();
    const otpKey = studentEmail || studentUsn;

    if (!otpKey || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your @msrit.edu email and the 6-digit OTP received.'
      });
    }

    const verification = verifyOtp(otpKey, otp);
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: verification.message || 'Invalid or expired OTP code.'
      });
    }

    // Retrieve verified student
    let user = studentEmail ? store.findUserByEmail(studentEmail) : null;
    if (!user && studentUsn) {
      user = store.findUserByUsn(studentUsn);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.'
      });
    }

    // If an email was provided, ensure it's recorded
    if (studentEmail && isMsritEmail(studentEmail)) {
      ensureMsritEmail(user, studentEmail);
    } else {
      ensureMsritEmail(user);
    }

    const token = generateToken(user._id);
    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: `Email verified successfully! Welcome, ${user.name}.`,
      token,
      user: userSafe
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed: ' + err.message
    });
  }
};

// @desc Resend OTP to student's @msrit.edu email
// @route POST /api/auth/resend-otp
const resendOtp = (req, res) => {
  return sendOtp(req, res);
};

// @desc Unified login endpoint
// @route POST /api/auth/login
const login = (req, res) => {
  if (req.body.otp) {
    return verifyLoginOtp(req, res);
  }
  return loginStep1(req, res);
};

// @desc Get current authenticated student profile
// @route GET /api/auth/me
const getMe = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

// @desc Get available demo student profiles for easy evaluation (strictly Maulik, Ashwath, Priya, Rohan)
// @route GET /api/auth/demo-users
const getDemoUsers = (req, res) => {
  const users = store.getDemoUsers ? store.getDemoUsers() : store.getAllUsers().filter(u => u.isDemo);
  return res.json({
    success: true,
    users
  });
};

// @desc Instant switch to a demo student for viva / presentation (NEVER allowed for Admin)
// @route POST /api/auth/quick-switch
const quickSwitch = (req, res) => {
  const { userId } = req.body;
  const user = store.findUserById(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Direct switching to Admin Panel is disabled. Administrator credentials are required.'
    });
  }

  ensureMsritEmail(user);

  const token = generateToken(user._id);
  const { password: _, ...userSafe } = user;

  return res.json({
    success: true,
    message: `Switched session to ${user.name} (${user.usn})`,
    token,
    user: userSafe
  });
};

module.exports = {
  getCaptcha,
  register,
  registerStep1,
  registerVerifyOtp,
  loginStep1,
  adminLogin,
  sendOtp,
  verifyLoginOtp,
  resendOtp,
  login,
  getMe,
  getDemoUsers,
  quickSwitch
};
