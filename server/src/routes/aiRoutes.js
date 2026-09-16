const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { generateContent } = require('../controllers/aiController');

const router = express.Router();

router.post('/generate', protect, authorize('EVENT_ORGANIZER', 'SPEAKER', 'PLATFORM_ADMIN'), generateContent);

module.exports = router;
