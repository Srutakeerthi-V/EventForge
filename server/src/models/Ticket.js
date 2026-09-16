const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketCategory', required: true },
  ticketNumber: { type: String, unique: true, required: true },
  qrData: { type: String, unique: true },
  qrCode: { type: String },
  status: { type: String, enum: ['active', 'used', 'cancelled', 'expired'], default: 'active' },
  isCheckedIn: { type: Boolean, default: false },
  checkInTime: { type: Date },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

ticketSchema.index({ event: 1 });
ticketSchema.index({ attendee: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
