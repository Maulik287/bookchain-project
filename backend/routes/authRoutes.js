const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/captcha', getCaptcha);
router.post('/register', register);
router.post('/register-step1', registerStep1);
router.post('/register-verify-otp', registerVerifyOtp);
router.post('/login', login);
router.post('/login-step1', loginStep1);
router.post('/admin-login', adminLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyLoginOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);
router.get('/demo-users', getDemoUsers);
router.post('/quick-switch', quickSwitch);

module.exports = router;
