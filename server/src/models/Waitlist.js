const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketCategory' },
  position: { type: Number },
  status: { type: String, enum: ['waiting', 'invited', 'registered', 'expired'], default: 'waiting' },
  invitedAt: { type: Date },
  expiresAt: { type: Date },
}, { timestamps: true });

waitlistSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
