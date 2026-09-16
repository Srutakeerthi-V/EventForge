const mongoose = require('mongoose');

const sessionAttendanceSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

sessionAttendanceSchema.index({ session: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('SessionAttendance', sessionAttendanceSchema);
