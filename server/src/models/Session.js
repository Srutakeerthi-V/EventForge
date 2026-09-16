const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  sessionType: {
    type: String,
    enum: ['keynote', 'panel', 'workshop', 'presentation', 'networking', 'break', 'other'],
    default: 'presentation'
  },
  capacity: { type: Number },
  topics: [{ type: String }],
  presentationMaterial: [{
    title: String,
    url: String,
    type: { type: String, enum: ['slides', 'video', 'document', 'other'] }
  }],
  attendanceCount: { type: Number, default: 0 },
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
}, { timestamps: true });

sessionSchema.index({ event: 1 });
sessionSchema.index({ room: 1, startTime: 1, endTime: 1 });
sessionSchema.index({ speaker: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Session', sessionSchema);
