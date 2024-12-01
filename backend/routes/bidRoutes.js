const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

// Route pour une enchère manuelle
router.post('/manual', protect, bidController.placeManualBid);

// Route pour une enchère automatique
router.post('/auto', protect, bidController.placeAutoBid);

// bidRoutes.js
router.get('/participating', protect, bidController.getParticipatingBids);


module.exports = router;
