const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { sendResponse } = require('../utils/helpers');

const router = express.Router();

router.get('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), (req, res) => {
  sendResponse(res, 200, true, 'Venue routes initialized', {
    user: req.user ? { id: req.user._id, role: req.user.role } : null,
  });
});

module.exports = router;
