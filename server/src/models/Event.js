const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  eventType: {
    type: String,
    enum: ['Conference', 'Workshop', 'Exhibition', 'Seminar', 'Corporate Event', 'Networking', 'Other'],
    required: true
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  banner: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationStartDate: { type: Date },
  registrationEndDate: { type: Date },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  capacity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublished: { type: Boolean, default: false },
  availableSeats: { type: Number, min: 0 },
  tags: [{ type: String }],
  topics: [{ type: String }],
  agenda: [{
    time: String,
    title: String,
    description: String
  }],
  registrationCount: { type: Number, default: 0 },
  checkInCount: { type: Number, default: 0 },
}, { timestamps: true });

eventSchema.index({ status: 1, isPublished: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ startDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
