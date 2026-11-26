const express = require('express');
const router = express.Router();
const { getUserDashboard, resetDemo } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserDashboard);
router.post('/reset-demo', resetDemo);

module.exports = router;
