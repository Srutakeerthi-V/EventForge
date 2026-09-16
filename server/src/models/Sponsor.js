const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'SponsorshipPackage' },
  brandName: { type: String, required: true },
  logo: { type: String },
  website: { type: String },
  description: { type: String },
  contactName: { type: String },
  contactEmail: { type: String },
  status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
  assets: [{
    title: String,
    url: String,
    type: { type: String, enum: ['logo', 'banner', 'video', 'document', 'other'] }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Sponsor', sponsorSchema);
