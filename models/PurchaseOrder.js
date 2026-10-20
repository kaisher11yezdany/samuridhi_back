const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber:    { type: String, unique: true },
  vendor:      { type: String, required: true },
  project:     { type: String },
  items:       { type: String },
  amount:      { type: String },
  orderDate:   { type: String },
  deliveryDate:{ type: String },
  receivedDate:{ type: String },
  approvedBy:  { type: String },
  remarks:     { type: String },
  status:      { type: String, enum: ['Draft','Pending','Approved','In Transit','Delivered','Cancelled'], default: 'Draft' },
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
