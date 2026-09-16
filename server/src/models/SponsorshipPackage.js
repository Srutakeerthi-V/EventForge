const mongoose = require('mongoose');

const sponsorshipPackageSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  benefits: [{ type: String }],
  slotsAvailable: { type: Number, default: 1 },
  slotsUsed: { type: Number, default: 0 },
  tier: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze', 'custom'], default: 'custom' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SponsorshipPackage', sponsorshipPackageSchema);
