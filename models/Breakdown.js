const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema({
  ticketId:   { type: String, unique: true },
  customer:   { type: String, required: true },
  site:       { type: String },
  elevatorId: { type: String },
  complaint:  { type: String, required: true },
  description:{ type: String },
  priority:   { type: String, enum: ['CRITICAL','HIGH','MEDIUM','LOW'], default: 'MEDIUM' },
  technician: { type: String },
  slaHours:   { type: Number, default: 24 },
  resolvedAt: { type: Date },
  status:     { type: String, enum: ['Pending','Assigned','In Progress','Resolved','Closed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Breakdown', breakdownSchema);
