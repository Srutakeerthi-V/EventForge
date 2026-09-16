const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  zipCode: { type: String },
  capacity: { type: Number, required: true },
  facilities: [{ type: String }],
  description: { type: String },
  images: [{ type: String }],
  contactName: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
