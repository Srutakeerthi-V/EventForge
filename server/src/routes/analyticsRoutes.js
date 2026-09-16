const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAnalytics,
  getAdminAnalytics,
  getOrganizerAnalytics,
  getStaffAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

router.get('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF', 'admin', 'organizer', 'staff'), getAnalytics);
router.get('/admin', protect, authorize('PLATFORM_ADMIN', 'admin'), getAdminAnalytics);
router.get('/organizer', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'organizer', 'admin'), getOrganizerAnalytics);
router.get('/staff', protect, authorize('EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'staff', 'organizer', 'admin'), getStaffAnalytics);

module.exports = router;
