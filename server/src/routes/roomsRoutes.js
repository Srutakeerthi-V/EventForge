const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');

const router = express.Router();

router.get('/', protect, getRooms);
router.post('/', protect, authorize('PLATFORM_ADMIN', 'EVENT_ORGANIZER'), createRoom);
router.get('/:id', protect, getRoomById);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);

module.exports = router;
