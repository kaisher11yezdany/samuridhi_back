const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      await AuditLog.create({ user: username, role: '-', action: 'Failed Login', module: 'Authentication', target: `Username: ${username}`, ip: req.ip, severity: 'Warning' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });
    await AuditLog.create({ user: user.name, role: user.role, action: 'Login', module: 'Authentication', target: `Username: ${username}`, ip: req.ip, severity: 'Info' });
    res.json({ token, user: { id: user._id, name: user.name, username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
