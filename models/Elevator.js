const mongoose = require('mongoose');

const elevatorSchema = new mongoose.Schema({
  elevatorId:       { type: String, unique: true },
  site:             { type: String, required: true },
  customer:         { type: String },
  building:         { type: String },
  floor:            { type: String },
  type:             { type: String, enum: ['Passenger','Goods','Residential','Hospital','MRL'], default: 'Passenger' },
  capacity:         { type: String },
  speed:            { type: String },
  installationDate: { type: String },
  warrantyExpiry:   { type: String },
  lastService:      { type: String },
  nextService:      { type: String },
  status:           { type: String, enum: ['Operational','Maintenance','Breakdown','Testing','Inactive'], default: 'Operational' },
}, { timestamps: true });

module.exports = mongoose.model('Elevator', elevatorSchema);
