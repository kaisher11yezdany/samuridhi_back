const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  partId:      { type: String, unique: true },
  partName:    { type: String, required: true },
  category:    { type: String },
  stock:       { type: Number, default: 0 },
  minStock:    { type: Number, default: 5 },
  costPerUnit: { type: String },
  supplier:    { type: String },
  location:    { type: String },
  status:      { type: String, enum: ['In Stock','Low Stock','Out of Stock'], default: 'In Stock' },
}, { timestamps: true });

module.exports = mongoose.model('SparePart', sparePartSchema);
