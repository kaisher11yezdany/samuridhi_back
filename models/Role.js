const mongoose = require('mongoose');

const MODULES = [
  'dashboard', 'notifications', 'customers', 'projects', 'sites',
  'survey', 'installation', 'procurement', 'qa', 'handover',
  'elevators', 'maintenance', 'breakdown', 'technicians',
  'testing', 'warranty', 'spareparts', 'documents',
  'approvals', 'reports', 'auditlogs', 'settings', 'users',
];

const SCOPE = { type: String, enum: ['none', 'own', 'all'], default: 'none' };

const permSchema = {};
MODULES.forEach(mod => {
  permSchema[mod] = {
    view:   { ...SCOPE },
    create: { ...SCOPE },
    edit:   { ...SCOPE },
    delete: { ...SCOPE },
  };
});

const roleSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  isSystem:    { type: Boolean, default: false },
  permissions: permSchema,
}, { timestamps: true });

roleSchema.statics.MODULES = MODULES;

module.exports = mongoose.model('Role', roleSchema);
