const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  maintenanceId: { type: String, unique: true },
  elevatorId:    { type: String, required: true },
  customer:      { type: String },
  site:          { type: String },
  schedule:      { type: String, enum: ['Monthly','Quarterly','Half-Yearly','Annual'], default: 'Monthly' },
  dueDate:       { type: String },
  completedDate: { type: String },
  technician:    { type: String },
  type:          { type: String, enum: ['Routine','Intensive','Emergency'], default: 'Routine' },
  remarks:       { type: String },
  status:        { type: String, enum: ['Scheduled','Pending','In Progress','Completed','Overdue'], default: 'Scheduled' },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
