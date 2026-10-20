const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema({
  qaId:       { type: String, unique: true },
  project:    { type: String, required: true },
  elevatorId: { type: String },
  customer:   { type: String },
  type:       { type: String, enum: ['Pre-Commission','Load Testing','Safety Check','Final Testing','Commissioning'], default: 'Final Testing' },
  inspector:  { type: String },
  date:       { type: String },
  score:      { type: String },
  checklist:  { type: Object, default: {} },
  remarks:    { type: String },
  status:     { type: String, enum: ['Pending','Scheduled','In Progress','Passed','Failed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('QARecord', qaSchema);
