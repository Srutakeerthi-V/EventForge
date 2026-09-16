const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketCategory', required: true },
  selectedSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  originalAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlisted'],
    default: 'pending'
  },
  registrationDate: { type: Date, default: Date.now },
  confirmationDate: { type: Date },
  cancellationDate: { type: Date },
  cancellationReason: { type: String },
  notes: { type: String },
}, { timestamps: true });

registrationSchema.index({ attendee: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
