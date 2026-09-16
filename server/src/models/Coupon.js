const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
