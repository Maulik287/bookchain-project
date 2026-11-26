const store = require('../data/storage');

// @desc Get full ownership history timeline for a specific book
// @route GET /api/journey/:bookId
const getBookJourney = (req, res) => {
  try {
    const { bookId } = req.params;
    const journey = store.getBookJourney(bookId);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in ownership registry.'
      });
    }

    return res.json({
      success: true,
      data: journey
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve book ownership history: ' + err.message
    });
  }
};

module.exports = {
  getBookJourney
};
