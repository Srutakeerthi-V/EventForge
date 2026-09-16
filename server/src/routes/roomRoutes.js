const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createRoom, getRooms, getRoomById, updateRoom, deleteRoom } = require('../controllers/roomController');

const router = express.Router();

router.get('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), getRooms);
router.post('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), createRoom);
router.get('/:id', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), getRoomById);
router.put('/:id', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), updateRoom);
router.delete('/:id', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), deleteRoom);

module.exports = router;
