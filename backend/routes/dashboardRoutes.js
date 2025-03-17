const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware'); // Si tu utilises un middleware pour protéger les routes

router.get('/dashboard-overview',protect, getDashboardOverview);
module.exports = router;