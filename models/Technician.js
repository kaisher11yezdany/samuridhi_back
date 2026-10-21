const mongoose = require('mongoose');

const techDocSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  docType:    { type: String, enum: ['ID Proof','Aadhar Card','PAN Card','Driving License','Passport','Police Verification','Training Certificate','Skill Certificate','Other'], default: 'Other' },
  filePath:   { type: String },
  fileSize:   { type: String },
  uploadedBy: { type: String },
  status:     { type: String, enum: ['Pending','Verified','Rejected'], default: 'Pending' },
  remarks:    { type: String },
}, { timestamps: true });

const technicianSchema = new mongoose.Schema({
  techId:        { type: String, unique: true },
  name:          { type: String, required: true },
  mobile:        { type: String },
  email:         { type: String },
  location:      { type: String },
  skills:        { type: String },
  zone:          { type: String },
  jobsCompleted: { type: Number, default: 0 },
  rating:        { type: Number, default: 4.5 },
  status:        { type: String, enum: ['Available','On Assignment','Leave','Inactive'], default: 'Available' },
  documents:     { type: [techDocSchema], default: [] },
  verified:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Technician', technicianSchema);
