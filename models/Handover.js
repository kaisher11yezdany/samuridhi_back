const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema({
  handoverId:   { type: String, unique: true },
  project:      { type: String, required: true },
  customer:     { type: String },
  elevators:    { type: Number, default: 1 },
  handoverDate: { type: String },
  acceptedBy:   { type: String },
  docs:         { type: [String], default: [] },
  remarks:      { type: String },
  status:       { type: String, enum: ['Pending','Scheduled','In Progress','Completed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Handover', handoverSchema);
