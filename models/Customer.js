const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId:    { type: String, unique: true },
  companyName:   { type: String, required: true },
  contactPerson: { type: String },
  email:         { type: String },
  phone:         { type: String },
  address:       { type: String },
  city:          { type: String },
  gstNumber:     { type: String },
  sites:         { type: Number, default: 0 },
  status:        { type: String, enum: ['Active','Pending','Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
