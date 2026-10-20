const express = require('express');
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Site = require('../models/Site');
const Project = require('../models/Project');
const Elevator = require('../models/Elevator');
const Breakdown = require('../models/Breakdown');
const Warranty = require('../models/Warranty');
const Maintenance = require('../models/Maintenance');
const router = express.Router();

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

router.get('/', auth, async (req, res) => {
  try {
    // KPI counts
    const [
      totalCustomers, totalSites, totalProjects,
      activeProjects, delayedProjects,
      totalElevators, operationalElevators, underMaintenance, breakdownElevators,
      activeAMC, openTickets, criticalIssues,
    ] = await Promise.all([
      Customer.countDocuments(),
      Site.countDocuments(),
      Project.countDocuments(),
      Project.countDocuments({ status: 'In Progress' }),
      Project.countDocuments({ status: 'Delayed' }),
      Elevator.countDocuments(),
      Elevator.countDocuments({ status: 'Operational' }),
      Elevator.countDocuments({ status: 'Maintenance' }),
      Elevator.countDocuments({ status: 'Breakdown' }),
      Warranty.countDocuments({ status: 'Active' }),
      Breakdown.countDocuments({ status: { $in: ['Pending','Assigned','In Progress'] } }),
      Breakdown.countDocuments({ priority: 'CRITICAL', status: { $in: ['Pending','Assigned','In Progress'] } }),
    ]);

    // Recent tickets (live from DB)
    const recentTickets = await Breakdown.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Monthly project aggregation — last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const projectMonthly = await Project.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, status: '$status' },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build monthly project chart data for last 6 months
    const monthlyProjects = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear(), mo = d.getMonth() + 1;
      const monthLabel = MONTHS[mo - 1];
      const rows = projectMonthly.filter(r => r._id.year === yr && r._id.month === mo);
      const completed = rows.find(r => r._id.status === 'Completed')?.count || 0;
      const newProj = rows.reduce((s, r) => s + r.count, 0);
      monthlyProjects.push({ month: monthLabel, completed, new: newProj });
    }

    // Monthly breakdown ticket trend — last 6 months
    const breakdownMonthly = await Breakdown.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, status: '$status' },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const ticketTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear(), mo = d.getMonth() + 1;
      const monthLabel = MONTHS[mo - 1];
      const rows = breakdownMonthly.filter(r => r._id.year === yr && r._id.month === mo);
      const open = rows.filter(r => ['Pending','Assigned','In Progress'].includes(r._id.status)).reduce((s,r) => s + r.count, 0);
      const closed = rows.filter(r => ['Resolved','Closed'].includes(r._id.status)).reduce((s,r) => s + r.count, 0);
      ticketTrend.push({ month: monthLabel, open, closed });
    }

    // Elevator status distribution (live)
    const elevatorStatus = [
      { name: 'Operational', value: operationalElevators, color: '#1baf7a' },
      { name: 'Maintenance',  value: underMaintenance,    color: '#eda100' },
      { name: 'Breakdown',    value: breakdownElevators,  color: '#e34948' },
    ];

    // Monthly maintenance revenue proxy (count * avg value)
    const maintenanceMonthly = await Maintenance.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: 'Completed' } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear(), mo = d.getMonth() + 1;
      const monthLabel = MONTHS[mo - 1];
      const row = maintenanceMonthly.find(r => r._id.year === yr && r._id.month === mo);
      // Each completed maintenance ~= ₹2L average service value
      const revenue = (row?.count || 0) * 2 + Math.round(activeAMC * 0.15);
      monthlyRevenue.push({ month: monthLabel, revenue });
    }

    res.json({
      // KPIs
      totalCustomers, totalSites, totalProjects,
      activeProjects, delayedProjects,
      totalElevators, operationalElevators, underMaintenance, breakdownElevators,
      activeAMC, openTickets, criticalIssues,
      // Chart data
      recentTickets,
      monthlyProjects,
      ticketTrend,
      elevatorStatus,
      monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
