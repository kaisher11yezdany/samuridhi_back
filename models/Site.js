const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  siteId:    { type: String, unique: true },
  siteName:  { type: String, required: true },
  customer:  { type: String, required: true },
  address:   { type: String },
  city:      { type: String },
  location:  { type: String },
  elevators: { type: Number, default: 0 },
  status:    { type: String, enum: ['Operational','Under Installation','Maintenance','Inactive'], default: 'Operational' },
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
