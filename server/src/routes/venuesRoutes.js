const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');

const router = express.Router();

router.get('/', protect, getVenues);
router.post('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), createVenue);
router.get('/:id', protect, getVenueById);
router.put('/:id', protect, updateVenue);
router.delete('/:id', protect, deleteVenue);

module.exports = router;
