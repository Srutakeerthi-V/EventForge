const mongoose = require('mongoose');

const userInterestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  topics: [{ type: String }],
  eventTypes: [{ type: String }],
  industries: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('UserInterest', userInterestSchema);
