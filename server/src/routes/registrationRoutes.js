const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createRegistration, getMyRegistrations, getEventRegistrations } = require('../controllers/registrationController');

const router = express.Router();

router.post('/', protect, authorize('ATTENDEE'), createRegistration);
router.get('/mine', protect, authorize('ATTENDEE'), getMyRegistrations);
router.get('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF'), getEventRegistrations);

module.exports = router;
