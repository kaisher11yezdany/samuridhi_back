const mongoose = require('mongoose');

const testingSchema = new mongoose.Schema({
  testId:     { type: String, unique: true },
  elevatorId: { type: String, required: true },
  customer:   { type: String },
  site:       { type: String },
  testDate:   { type: String },
  mechanical: { type: String, enum: ['Pass','Fail','-'], default: '-' },
  electrical: { type: String, enum: ['Pass','Fail','-'], default: '-' },
  safety:     { type: String, enum: ['Pass','Fail','-'], default: '-' },
  inspector:  { type: String },
  remarks:    { type: String },
  status:     { type: String, enum: ['Pending','Scheduled','In Progress','Completed','Failed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Testing', testingSchema);
