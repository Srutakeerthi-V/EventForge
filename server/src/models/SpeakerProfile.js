const mongoose = require('mongoose');

const speakerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  designation: { type: String },
  company: { type: String },
  bio: { type: String },
  expertise: [{ type: String }],
  linkedin: { type: String },
  twitter: { type: String },
  website: { type: String },
  photo: { type: String },
  availability: [{
    date: Date,
    startTime: String,
    endTime: String,
    isAvailable: { type: Boolean, default: true }
  }],
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SpeakerProfile', speakerProfileSchema);
