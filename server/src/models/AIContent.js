const mongoose = require('mongoose');

const aiContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['event_description', 'speaker_bio', 'announcement', 'session_summary', 'session_recommendation'],
    required: true
  },
  prompt: { type: String },
  content: { type: String, required: true },
  relatedTo: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isUsed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('AIContent', aiContentSchema);
