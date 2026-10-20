const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Breakdown = require('../models/Breakdown');
const Technician = require('../models/Technician');
const Elevator = require('../models/Elevator');
const Customer = require('../models/Customer');
const Warranty = require('../models/Warranty');
const router = express.Router();

router.get('/summary', auth, async (req, res) => {
  try {
    const [projects, breakdowns, technicians, elevators, customers, warranties] = await Promise.all([
      Project.find(),
      Breakdown.find(),
      Technician.find(),
      Elevator.find(),
      Customer.find(),
      Warranty.find(),
    ]);
    const projectPerf = projects.slice(0, 5).map(p => ({
      name: p.customer,
      elevators: p.elevators,
      progress: p.progress,
      status: p.status,
      budget: p.budget,
      cost: p.cost,
    }));
    const techPerf = technicians.slice(0, 5).map(t => ({
      name: t.name,
      location: t.location,
      skills: t.skills,
      jobsCompleted: t.jobsCompleted,
      rating: t.rating,
      status: t.status,
    }));
    res.json({ projectPerf, techPerf, totalProjects: projects.length, totalBreakdowns: breakdowns.length, totalTechnicians: technicians.length, totalElevators: elevators.length, totalCustomers: customers.length, activeAMC: warranties.filter(w => w.status === 'Active').length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
