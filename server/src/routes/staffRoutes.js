const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { assignStaff, listAssignments } = require('../controllers/staffController');

const router = express.Router();

router.get('/', protect, authorize('EVENT_ORGANIZER', 'EVENT_STAFF', 'PLATFORM_ADMIN'), listAssignments);
router.post('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), assignStaff);

module.exports = router;
