const mongoose = require('mongoose');

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
}, { timestamps: true });

module.exports = mongoose.model('Technician', technicianSchema);
