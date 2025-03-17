const express = require('express');
const router = express.Router();
const { getPlatformRevenue } = require('../controllers/adminRevenueController');
const { protect } = require('../middleware/authMiddleware');

// Route pour récupérer les revenus
router.get('/revenues', protect, getPlatformRevenue);

module.exports = router;
