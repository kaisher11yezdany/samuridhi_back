const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  approvalId:   { type: String, unique: true },
  type:         { type: String, enum: ['Purchase Order','Leave Request','Expense Claim','Contract Change','Customer Discount','Other'], required: true },
  reference:    { type: String },
  description:  { type: String },
  requestedBy:  { type: String },
  priority:     { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'MEDIUM' },
  currentLevel: { type: String },
  approvedBy:   { type: String },
  remarks:      { type: String },
  status:       { type: String, enum: ['Pending','In Review','Approved','Rejected'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Approval', approvalSchema);
