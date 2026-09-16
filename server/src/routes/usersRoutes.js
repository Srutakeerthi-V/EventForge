const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  getMyProfile,
  updateUser,
  changePassword,
  toggleUserStatus,
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateUser);
router.put('/me/password', protect, changePassword);
router.get('/', protect, authorize('PLATFORM_ADMIN'), getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.patch('/:id/status', protect, authorize('PLATFORM_ADMIN'), toggleUserStatus);

module.exports = router;
