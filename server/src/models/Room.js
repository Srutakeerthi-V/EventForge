const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  name: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true },
  floor: { type: String },
  facilities: [{ type: String }],
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
