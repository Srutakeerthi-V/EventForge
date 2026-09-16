const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String },
  logo: { type: String },
  website: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  industry: { type: String },
  size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
}, { timestamps: true });

organizationSchema.pre('save', function() {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
});

module.exports = mongoose.model('Organization', organizationSchema);
