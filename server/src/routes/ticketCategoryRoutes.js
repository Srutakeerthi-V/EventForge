const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  createTicketCategory,
  getTicketCategoriesByEvent,
  updateTicketCategory,
  deleteTicketCategory,
} = require('../controllers/ticketCategoryController');

// GET /api/ticket-categories?eventId=<id>  -> public (optionalAuth for role-based filtering)
router.get('/', optionalAuth, getTicketCategoriesByEvent);

// POST /api/ticket-categories              -> create category
router.post('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), createTicketCategory);

// PUT /api/ticket-categories/:id           -> update category
router.put('/:id', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), updateTicketCategory);

// DELETE /api/ticket-categories/:id        -> delete category
router.delete('/:id', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), deleteTicketCategory);

module.exports = router;
