const store = require('../data/storage');

// @desc Get user dashboard aggregation (listed, owned, given away, activity)
// @route GET /api/dashboard
const getUserDashboard = (req, res) => {
  try {
    const dashboardData = store.getUserDashboard(req.user._id);

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate dashboard: ' + err.message
    });
  }
};

// @desc Reset store to demo defaults for viva demonstration
// @route POST /api/dashboard/reset-demo
const resetDemo = (req, res) => {
  try {
    store.resetDemoData();
    return res.json({
      success: true,
      message: 'Catalogue and ownership history reset to original college demo data!'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset data: ' + err.message
    });
  }
};

module.exports = {
  getUserDashboard,
  resetDemo
};
