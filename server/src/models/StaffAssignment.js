const mongoose = require('mongoose');

const staffAssignmentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'staff' },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  duties: [{ type: String }],
  status: { type: String, enum: ['assigned', 'confirmed', 'declined'], default: 'assigned' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

staffAssignmentSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('StaffAssignment', staffAssignmentSchema);
