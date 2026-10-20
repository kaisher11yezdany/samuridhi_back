const express = require('express');
const jwt = require('jsonwebtoken');
const CustomerUser = require('../models/CustomerUser');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await CustomerUser.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Account is inactive. Contact support.' });
    }
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      customerId: user.customerId,
      companyName: user.companyName,
      role: user.role,
      type: 'customer',
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile,
              customerId: user.customerId, companyName: user.companyName, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register (admin creates customer app users)
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, customerId, companyName, role } = req.body;
    if (!name || !email || !password || !customerId) {
      return res.status(400).json({ message: 'name, email, password, customerId are required' });
    }
    const exists = await CustomerUser.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await CustomerUser.create({ name, email, mobile, password, customerId, companyName, role });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, customerId: user.customerId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customer auth middleware for portal routes
function customerAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'customer') return res.status(403).json({ message: 'Not a customer token' });
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { router, customerAuth };
