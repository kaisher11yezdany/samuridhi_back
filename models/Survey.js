const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  surveyId:   { type: String, unique: true },
  project:    { type: String, required: true },
  site:       { type: String },
  customer:   { type: String },
  type:       { type: String, enum: ['Pre-Installation','Site Inspection','Feasibility Study','Post-Installation Audit'], default: 'Pre-Installation' },
  engineer:   { type: String },
  date:       { type: String },
  checklist:  { type: Object, default: {} },
  findings:   { type: String },
  status:     { type: String, enum: ['Scheduled','Pending','In Progress','Completed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);
