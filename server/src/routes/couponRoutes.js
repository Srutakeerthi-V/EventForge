const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCoupon,
  getCoupons,
  validateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

// GET /api/coupons              -> list coupons (organizer/admin)
router.get('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), getCoupons);

// POST /api/coupons             -> create coupon (organizer/admin)
router.post('/', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), createCoupon);

// POST /api/coupons/validate    -> validate coupon code (any authenticated user)
// IMPORTANT: /validate must be before /:id to avoid routing conflict
router.post('/validate', protect, validateCoupon);

// DELETE /api/coupons/:id       -> delete coupon (organizer/admin)
router.delete('/:id', protect, authorize('EVENT_ORGANIZER', 'PLATFORM_ADMIN'), deleteCoupon);

module.exports = router;
