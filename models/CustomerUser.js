const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const customerUserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  mobile:     { type: String },
  password:   { type: String, required: true },
  customerId: { type: String, required: true },  // links to Customer.customerId
  companyName:{ type: String },
  role:       { type: String, enum: ['Customer Admin','Facility Manager','Viewer'], default: 'Customer Admin' },
  status:     { type: String, enum: ['Active','Inactive'], default: 'Active' },
}, { timestamps: true });

customerUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

customerUserSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('CustomerUser', customerUserSchema);
