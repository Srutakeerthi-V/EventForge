const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { recordAttendance, getSessionAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.post('/', protect, authorize('EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN'), recordAttendance);
router.get('/session/:sessionId', protect, authorize('EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN'), getSessionAttendance);

module.exports = router;
