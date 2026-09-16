const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createAnnouncement, listAnnouncements } = require('../controllers/announcementController');

const router = express.Router();

router.get('/', protect, authorize('EVENT_ORGANIZER', 'ATTENDEE', 'PLATFORM_ADMIN'), listAnnouncements);
router.post('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), createAnnouncement);

module.exports = router;
