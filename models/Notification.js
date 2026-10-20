const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type:    { type: String, enum: ['Info','Warning','Critical'], default: 'Info' },
  icon:    { type: String, default: 'ℹ️' },
  title:   { type: String, required: true },
  message: { type: String },
  module:  { type: String },
  userId:  { type: String },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
