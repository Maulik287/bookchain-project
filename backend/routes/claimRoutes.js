const express = require('express');
const router = express.Router();
const {
  claimBook,
  relistBook,
  requestBook,
  cancelBookRequest,
  payPenalty
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:bookId', protect, claimBook);
router.post('/:bookId/relist', protect, relistBook);
router.post('/:bookId/request', protect, requestBook);
router.delete('/:bookId/request', protect, cancelBookRequest);
router.post('/:bookId/pay-penalty', protect, payPenalty);

module.exports = router;
