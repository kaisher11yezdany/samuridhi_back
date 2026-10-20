const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user:     { type: String },
  role:     { type: String },
  action:   { type: String, required: true },
  module:   { type: String },
  target:   { type: String },
  ip:       { type: String },
  severity: { type: String, enum: ['Info','Warning','Critical'], default: 'Info' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
