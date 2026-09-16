const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { submitFeedback, listFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', protect, authorize('ATTENDEE'), submitFeedback);
router.get('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), listFeedback);

module.exports = router;
