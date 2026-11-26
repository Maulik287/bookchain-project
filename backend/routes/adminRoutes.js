const express = require('express');
const router = express.Router();
const {
  getAdminOverview,
  waivePenalty,
  forceRelist,
  simulateOverdue,
  deleteBookAdmin
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/overview', getAdminOverview);
router.post('/books/:bookId/waive-penalty', waivePenalty);
router.post('/books/:bookId/force-relist', forceRelist);
router.post('/books/:bookId/simulate-overdue', simulateOverdue);
router.delete('/books/:bookId', deleteBookAdmin);

module.exports = router;
