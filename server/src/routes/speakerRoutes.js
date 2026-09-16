const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrUpdateProfile,
  getMyProfile,
  getAllSpeakers,
  getSpeakerById,
  updateAvailability,
} = require('../controllers/speakerController');

// GET /api/speakers        -> all speakers (organizer/admin only)
router.get('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), getAllSpeakers);

// GET /api/speakers/me     -> speaker's own profile
router.get('/me', protect, authorize('SPEAKER'), getMyProfile);

// POST /api/speakers/me    -> create/update profile
router.post('/me', protect, authorize('SPEAKER'), createOrUpdateProfile);

// PUT /api/speakers/me     -> create/update profile (idempotent)
router.put('/me', protect, authorize('SPEAKER'), createOrUpdateProfile);

// PUT /api/speakers/me/availability -> update availability array
router.put('/me/availability', protect, authorize('SPEAKER'), updateAvailability);

// GET /api/speakers/:userId -> get speaker by userId
router.get('/:userId', protect, getSpeakerById);

module.exports = router;
