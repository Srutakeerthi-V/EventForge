const mongoose = require('mongoose');

const ticketCategorySchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['General', 'Student', 'VIP', 'Early Bird', 'Premium'],
    default: 'General'
  },
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  benefits: [{ type: String }],
  saleStartDate: { type: Date },
  saleEndDate: { type: Date },
  maxPerPerson: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('TicketCategory', ticketCategorySchema);
