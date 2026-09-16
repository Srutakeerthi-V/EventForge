const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  joinWaitlist,
  getWaitlist,
  getMyWaitlists,
  removeFromWaitlist,
} = require('../controllers/waitlistController');

// POST /api/waitlist            -> attendee joins waitlist
router.post('/', protect, authorize('ATTENDEE'), joinWaitlist);

// GET /api/waitlist?eventId=<id> -> organizer/admin gets waitlist for event
router.get('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), getWaitlist);

// GET /api/waitlist/mine        -> attendee: own waitlist entries
// IMPORTANT: /mine must be before /:id
router.get('/mine', protect, authorize('ATTENDEE'), getMyWaitlists);

// DELETE /api/waitlist/:id      -> remove from waitlist (owner or admin)
router.delete('/:id', protect, removeFromWaitlist);

module.exports = router;
