const express = require('express');
const router  = express.Router();
const { customerAuth } = require('./customerAuth');

const Project     = require('../models/Project');
const Elevator    = require('../models/Elevator');
const Breakdown   = require('../models/Breakdown');
const Maintenance = require('../models/Maintenance');
const Document    = require('../models/Document');
const Notification= require('../models/Notification');
const Customer    = require('../models/Customer');
const Warranty    = require('../models/Warranty');

router.use(customerAuth);

// ── Dashboard summary ──────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const cname = req.customer.companyName;
    const [projects, elevators, tickets, maintenance] = await Promise.all([
      Project.find({ customer: { $regex: cname, $options: 'i' } }),
      Elevator.find({ customer: { $regex: cname, $options: 'i' } }),
      Breakdown.find({ customer: { $regex: cname, $options: 'i' } }),
      Maintenance.find({ customer: { $regex: cname, $options: 'i' } }),
    ]);
    res.json({
      activeProjects:    projects.filter(p => p.status === 'In Progress').length,
      totalElevators:    elevators.length,
      openTickets:       tickets.filter(t => !['Resolved','Closed'].includes(t.status)).length,
      upcomingMaintenance: maintenance.filter(m => m.status === 'Scheduled').length,
      recentProjects:    projects.slice(-3).reverse(),
      recentTickets:     tickets.slice(-3).reverse(),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Projects ───────────────────────────────────────────────────────────────
router.get('/projects', async (req, res) => {
  try {
    const cname = req.customer.companyName;
    const projects = await Project.find({ customer: { $regex: cname, $options: 'i' } }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Elevators ──────────────────────────────────────────────────────────────
router.get('/elevators', async (req, res) => {
  try {
    const cname = req.customer.companyName;
    const elevators = await Elevator.find({ customer: { $regex: cname, $options: 'i' } }).sort({ createdAt: -1 });
    res.json(elevators);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/elevators/:id', async (req, res) => {
  try {
    const elevator = await Elevator.findById(req.params.id);
    if (!elevator) return res.status(404).json({ message: 'Elevator not found' });
    res.json(elevator);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Service Tickets (Breakdown) ────────────────────────────────────────────
router.get('/tickets', async (req, res) => {
  try {
    const cname = req.customer.companyName;
    const tickets = await Breakdown.find({ customer: { $regex: cname, $options: 'i' } }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Breakdown.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/tickets', async (req, res) => {
  try {
    const cid = req.customer.companyName;
    const { elevatorId, site, complaint, description, priority, category } = req.body;
    if (!complaint) return res.status(400).json({ message: 'Complaint description is required' });

    // Generate ticket ID
    const count = await Breakdown.countDocuments();
    const ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;

    const ticket = await Breakdown.create({
      ticketId, customer: cid, site, elevatorId,
      complaint: category ? `[${category}] ${complaint}` : complaint,
      description, priority: priority || 'MEDIUM', status: 'Pending',
    });
    res.status(201).json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Maintenance ────────────────────────────────────────────────────────────
router.get('/maintenance', async (req, res) => {
  try {
    const cname = req.customer.companyName;
    const records = await Maintenance.find({ customer: { $regex: cname, $options: 'i' } }).sort({ dueDate: 1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Documents ──────────────────────────────────────────────────────────────
router.get('/documents', async (req, res) => {
  try {
    const cname = req.customer.companyName;
    const docs = await Document.find({ customer: { $regex: cname, $options: 'i' } }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Notifications ──────────────────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(30);
    res.json(notifications);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Warranty / AMC ─────────────────────────────────────────────────────────
router.get('/warranty', async (req, res) => {
  try {
    const cname = req.customer.companyName;
    const elevators = await Elevator.find({ customer: { $regex: cname, $options: 'i' } },
      'elevatorId site warrantyExpiry status nextService');
    res.json(elevators);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Profile ────────────────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const CustomerUser = require('../models/CustomerUser');
    const user = await CustomerUser.findById(req.customer.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/profile', async (req, res) => {
  try {
    const CustomerUser = require('../models/CustomerUser');
    const { name, mobile } = req.body;
    const user = await CustomerUser.findByIdAndUpdate(
      req.customer.id, { name, mobile }, { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/change-password', async (req, res) => {
  try {
    const CustomerUser = require('../models/CustomerUser');
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    const user = await CustomerUser.findById(req.customer.id);
    if (!user || !(await user.matchPassword(currentPassword)))
      return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
