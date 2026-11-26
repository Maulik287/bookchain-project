const store = require('../data/storage');

// @desc Get full Admin Panel overview (stats, books, users, payments)
// @route GET /api/admin/overview
const getAdminOverview = (req, res) => {
  try {
    const overview = store.getAdminOverview();
    return res.json({
      success: true,
      data: overview
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin overview: ' + err.message
    });
  }
};

// @desc Waive overdue penalty for a book
// @route POST /api/admin/books/:bookId/waive-penalty
const waivePenalty = (req, res) => {
  try {
    const book = store.adminWaivePenalty(req.params.bookId);
    return res.json({
      success: true,
      message: `Penalty waived for '${book.title}'.`,
      data: book
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Force return a claimed book back to Book DB (Available)
// @route POST /api/admin/books/:bookId/force-relist
const forceRelist = (req, res) => {
  try {
    const book = store.adminForceRelist(req.params.bookId);
    return res.json({
      success: true,
      message: `'${book.title}' returned to Book DB as Available.`,
      data: book
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Simulate overdue status (e.g., 19 days held -> 4 days overdue = ₹20 penalty) for testing/demo
// @route POST /api/admin/books/:bookId/simulate-overdue
const simulateOverdue = (req, res) => {
  try {
    const daysAgo = Number(req.body?.daysAgo) || 19;
    const book = store.adminSimulateOverdue(req.params.bookId, daysAgo);
    return res.json({
      success: true,
      message: `Simulated ${daysAgo} days held (${Math.max(0, daysAgo - 15)} days overdue) for '${book.title}'.`,
      data: book
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc Delete any book from Book DB (Admin)
// @route DELETE /api/admin/books/:bookId
const deleteBookAdmin = (req, res) => {
  try {
    const deleted = store.adminDeleteBook(req.params.bookId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    return res.json({
      success: true,
      message: 'Book permanently removed from Book DB.'
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getAdminOverview,
  waivePenalty,
  forceRelist,
  simulateOverdue,
  deleteBookAdmin
};
