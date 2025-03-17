const express = require('express');
const router = express.Router();
const { getVendorOverview } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware'); // Si tu utilises un middleware pour protéger les routes

router.get('/vendor-dashboard-overview', protect, getVendorOverview);

module.exports = router;