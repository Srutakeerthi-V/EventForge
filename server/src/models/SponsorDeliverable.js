const mongoose = require('mongoose');

const sponsorDeliverableSchema = new mongoose.Schema({
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('SponsorDeliverable', sponsorDeliverableSchema);
