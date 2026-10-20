const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId:  { type: String, unique: true },
  projectName:{ type: String },
  customer:   { type: String, required: true },
  site:       { type: String },
  elevators:  { type: Number, default: 1 },
  startDate:  { type: String },
  targetDate: { type: String },
  progress:   { type: Number, default: 0, min: 0, max: 100 },
  budget:     { type: String },
  cost:       { type: String },
  manager:    { type: String },
  status:     { type: String, enum: ['Not Started','In Progress','Completed','Delayed','On Hold'], default: 'Not Started' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
