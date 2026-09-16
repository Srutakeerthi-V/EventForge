const express = require('express');
const { protect } = require('../middleware/auth');
const { getCurrentUser } = require('../controllers/authController');

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User management endpoints are available',
    data: { user: req.user },
  });
});

module.exports = router;
