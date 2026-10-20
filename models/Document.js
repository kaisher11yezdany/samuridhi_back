const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  docId:      { type: String, unique: true },
  name:       { type: String, required: true },
  category:   { type: String, enum: ['Completion Certificate','Engineering Drawing','O&M Manual','Warranty','AMC Agreement','Inspection Report','Template','Other'], default: 'Other' },
  project:    { type: String },
  customer:   { type: String },
  uploadedBy: { type: String },
  fileSize:   { type: String },
  filePath:   { type: String },
  status:     { type: String, enum: ['Active','Expired','Archived'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
