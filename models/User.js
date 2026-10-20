const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name:     { type: String, required: true },
  email:    { type: String },
  phone:    { type: String },
  role:     { type: String, enum: ['Super Admin','Management','Project Manager','Site Engineer','Technician','Customer','Accounts','HR'], default: 'Management' },
  status:   { type: String, enum: ['Active','Inactive'], default: 'Active' },
  roleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
