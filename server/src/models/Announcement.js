const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'urgent', 'update', 'reminder'], default: 'general' },
  targetRoles: [{ type: String, enum: ['all', 'attendee', 'speaker', 'sponsor', 'staff'] }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
