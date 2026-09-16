const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  type: { type: String, enum: ['event', 'session'], default: 'event' },
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

feedbackSchema.index({ event: 1, attendee: 1, type: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
