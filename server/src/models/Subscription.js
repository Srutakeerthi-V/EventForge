const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  plan: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  status: { type: String, enum: ['active', 'inactive', 'cancelled', 'expired'], default: 'active' },
  maxEvents: { type: Number, default: 3 },
  maxAttendees: { type: Number, default: 100 },
  features: [{ type: String }],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  price: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
