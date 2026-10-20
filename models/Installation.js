const mongoose = require('mongoose');

const installationSchema = new mongoose.Schema({
  installationId: { type: String, unique: true },
  elevatorId:  { type: String },
  customer:    { type: String, required: true },
  site:        { type: String },
  startDate:   { type: String },
  targetDate:  { type: String },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  supervisor:  { type: String },
  team:        { type: [String], default: [] },
  remarks:     { type: String },
  status:      { type: String, enum: ['Not Started','In Progress','Completed','On Hold'], default: 'Not Started' },
}, { timestamps: true });

module.exports = mongoose.model('Installation', installationSchema);
