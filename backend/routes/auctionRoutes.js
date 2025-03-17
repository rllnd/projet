const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { protect} = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditLogger'); 
// Routes pour les vendeurs et administrateurs
router.get('/active', protect, auctionController.getActiveAuctions);
router.get('/closed', protect, auctionController.getClosedAuctions);
// Route pour récupérer les enchères annulées
router.get('/cancelled', protect, auctionController.getCancelledAuctions);

// Routes spécifiques à l'administration
router.post('/create', protect, auctionController.createAuction);
router.post('/bid', protect, auctionController.placeBid);
// Route pour récupérer les enchères gagnées
router.get('/won',  protect, auctionController.getWonAuctions);
router.get('/seller-auctions', protect, auctionController.getSellerAuctions);
router.put('/stop/:auctionId', protect,auditLogger, auctionController.stopAuction);
router.put('/finalize/:auctionId',protect, auctionController.finalizeAuction);
// Routes pour récupérer l'historique des enchères
router.get('/history', protect, auctionController.getAuctionHistory); // Historique des enchères
router.get('/statistics', protect,  auctionController.getAuctionStatistics); 
router.get('/statisticsSeller', protect, auctionController.getSellerAuctionStatistics);
router.get('/statisticsBuyer', protect, auctionController.getBuyerAuctionStatistics);
router.get('/stopped', protect, auctionController.getStoppedAuctions);
router.get('/sellerStopped', protect, auctionController.getSellerStoppedAuctions);
// Route pour les enchères annulées des acheteurs
router.get('/buyercancelled', protect, auctionController.getCancelledAuctionsForBuyer);
//route pour les enchères expirées(perdues) des acheteurs
router.get('/buyerexpired', protect,  auctionController.getExpiredAuctionsForBuyer);

router.get('/history-transactions', protect,  auctionController.getBuyerAuctionHistory);

    

module.exports = router;
