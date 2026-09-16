const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getMySessions,
} = require('../controllers/sessionController');

// GET /api/sessions?eventId=<id>  -> get sessions for an event (public/authenticated)
router.get('/', optionalAuth, getSessions);

// GET /api/sessions/mine           -> speaker: get their own sessions
router.get('/mine', protect, authorize('SPEAKER', 'speaker'), getMySessions);

// POST /api/sessions               -> create session
router.post('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'organizer', 'admin'), createSession);

// GET /api/sessions/:id            -> get single session
router.get('/:id', optionalAuth, getSessionById);

// PUT /api/sessions/:id            -> update session
router.put('/:id', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'organizer', 'admin'), updateSession);

// DELETE /api/sessions/:id         -> delete session
router.delete('/:id', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN', 'organizer', 'admin'), deleteSession);

module.exports = router;
