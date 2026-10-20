const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  warrantyId: { type: String, unique: true },
  elevatorId: { type: String, required: true },
  customer:   { type: String },
  site:       { type: String },
  amcStart:   { type: String },
  amcEnd:     { type: String },
  type:       { type: String, enum: ['Comprehensive','Standard','Basic'], default: 'Standard' },
  coverage:   { type: String },
  value:      { type: String },
  renewalDate:{ type: String },
  status:     { type: String, enum: ['Active','Expiring Soon','Expired','Renewed'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Warranty', warrantySchema);
