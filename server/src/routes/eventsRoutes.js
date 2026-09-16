const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  publishEvent,
  changeEventStatus,
  deleteEvent,
} = require('../controllers/eventController');

const router = express.Router();

router.get('/', optionalAuth, getEvents);
router.post('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), createEvent);
router.get('/:id', optionalAuth, getEventById);
router.put('/:id', protect, updateEvent);
router.patch('/:id/publish', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), publishEvent);
router.patch('/:id/status', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), changeEventStatus);
router.delete('/:id', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), deleteEvent);

module.exports = router;
