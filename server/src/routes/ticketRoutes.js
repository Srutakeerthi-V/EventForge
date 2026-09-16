const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMyTickets,
  getTicket,
  validateTicket,
  checkInTicket
} = require('../controllers/ticketController');

const router = express.Router();

router.get('/mine', protect, authorize('ATTENDEE', 'attendee'), getMyTickets);
router.post('/check-in', protect, authorize('EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'staff', 'organizer', 'admin'), checkInTicket);
router.post('/checkin', protect, authorize('EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'staff', 'organizer', 'admin'), checkInTicket);
router.get('/validate', protect, authorize('EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'staff', 'organizer', 'admin'), validateTicket);
router.post('/validate', protect, authorize('EVENT_STAFF', 'EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'staff', 'organizer', 'admin'), validateTicket);
router.get('/:id', protect, getTicket);

module.exports = router;
