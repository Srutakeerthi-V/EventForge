const Coupon = require('../models/Coupon');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (organizer, admin)
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      event,
      discountType,
      discountValue,
      minAmount,
      maxUses,
      expiryDate,
      description,
      isActive,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'code, discountType, and discountValue are required',
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'A coupon with this code already exists',
      });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      event: event || undefined,
      discountType,
      discountValue,
      minAmount: minAmount || 0,
      maxUses: maxUses !== undefined ? maxUses : null,
      expiryDate: expiryDate || undefined,
      description,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get coupons (optionally filter by eventId)
// @route   GET /api/coupons
// @access  Private (organizer, admin)
const getCoupons = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.eventId) {
      filter.event = req.query.eventId;
    }

    const coupons = await Coupon.find(filter)
      .populate('event', 'title startDate')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a coupon code before checkout
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res, next) => {
  try {
    const { code, eventId, amount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    // 1. Exists?
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon code not found',
      });
    }

    // 2. Active?
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active',
      });
    }

    // 3. Expired?
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired',
      });
    }

    // 4. Max uses exceeded?
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum usage limit',
      });
    }

    // 5. Event-specific check?
    if (coupon.event && eventId) {
      if (coupon.event.toString() !== eventId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not valid for the selected event',
        });
      }
    }

    // 6. Minimum amount check (only if amount was provided)
    if (amount !== undefined && amount !== null) {
      const orderAmount = parseFloat(amount) || 0;
      if (coupon.minAmount && orderAmount < coupon.minAmount) {
        return res.status(400).json({
          success: false,
          message: `A minimum purchase of $${coupon.minAmount} is required to use this coupon`,
        });
      }
    }

    // Calculate discount
    const orderAmount = parseFloat(amount) || 0;
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = orderAmount > 0 ? (orderAmount * coupon.discountValue) / 100 : coupon.discountValue;
    } else {
      discountAmount = orderAmount > 0 ? Math.min(orderAmount, coupon.discountValue) : coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minAmount: coupon.minAmount,
          discountAmount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (organizer, admin)
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  validateCoupon,
  deleteCoupon,
};
