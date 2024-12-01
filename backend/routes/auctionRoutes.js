const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { protect} = require('../middleware/authMiddleware');

// Routes pour les vendeurs et administrateurs
router.get('/active', protect, auctionController.getActiveAuctions);
router.get('/closed', protect, auctionController.getClosedAuctions);
// Route pour récupérer les enchères annulées
router.get('/cancelled', protect, auctionController.getCancelledAuctions);

// Routes spécifiques à l'administration
router.post('/create', protect, auctionController.createAuction);
router.post('/bid', protect, auctionController.placeBid);

    

module.exports = router;
