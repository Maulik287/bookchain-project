const store = require('../data/storage');

// @desc Claim an available book (starts 15-day time limit)
// @route POST /api/claims/:bookId
const claimBook = (req, res) => {
  try {
    const { bookId } = req.params;
    const { currentCondition, notes, academicSemesterUsed, studentFeedback, location } = req.body;

    const result = store.claimBook(bookId, req.user._id, {
      currentCondition,
      notes,
      academicSemesterUsed,
      studentFeedback,
      location
    });

    return res.status(200).json({
      success: true,
      message: `Congratulations! You have claimed '${result.book.title}'. 15-day reading limit started.`,
      data: result
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Pass It On — Enforce penalty clearance, pass to Req #1 (FCFS) if queued, else loop back to Book DB
// @route POST /api/claims/:bookId/relist
const relistBook = (req, res) => {
  try {
    const { bookId } = req.params;
    const { condition, notes } = req.body;

    const result = store.relistBook(bookId, req.user._id, { condition, notes });

    const message = result.passedToNext
      ? `'${result.book.title}' passed directly to #1 in FCFS Queue: ${result.nextOwner?.name || 'Next Student'}!`
      : `'${result.book.title}' is now back in the Book DB and Available for exchange!`;

    return res.status(200).json({
      success: true,
      message,
      passedToNext: result.passedToNext,
      nextOwner: result.nextOwner,
      data: result.book
    });
  } catch (err) {
    if (err.code === 'PENALTY_REQUIRED') {
      return res.status(402).json({
        success: false,
        requirePayment: true,
        penaltyAmount: err.penaltyAmount,
        overdueDays: err.overdueDays,
        message: err.message
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Join FCFS Request Queue for a claimed book
// @route POST /api/claims/:bookId/request
const requestBook = (req, res) => {
  try {
    const { bookId } = req.params;
    const updatedBook = store.requestBook(bookId, req.user._id);
    const pos = updatedBook.requestQueue.findIndex(r => r.userId === req.user._id) + 1;

    return res.status(200).json({
      success: true,
      message: `Added to FCFS Request Queue at position #${pos} for '${updatedBook.title}'.`,
      data: updatedBook
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Leave FCFS Request Queue
// @route DELETE /api/claims/:bookId/request
const cancelBookRequest = (req, res) => {
  try {
    const { bookId } = req.params;
    const updatedBook = store.cancelBookRequest(bookId, req.user._id);

    return res.status(200).json({
      success: true,
      message: `Removed from request queue for '${updatedBook.title}'.`,
      data: updatedBook
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Pay overdue penalty (₹5/day) via Payment Gateway
// @route POST /api/claims/:bookId/pay-penalty
const payPenalty = (req, res) => {
  try {
    const { bookId } = req.params;
    const { method, paymentRef } = req.body;

    const result = store.payBookPenalty(bookId, req.user._id, { method, paymentRef });

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${result.payment.amount} successful! Transaction ID: ${result.payment.txnId}`,
      payment: result.payment,
      data: result.book
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  claimBook,
  relistBook,
  requestBook,
  cancelBookRequest,
  payPenalty
};
