// routes/platformRoutes.js
const express = require('express');
const router = express.Router();
const platformController = require('../controllers/plateformController');
const {protect} = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditLogger'); 

router.get('/platform-balance', protect, platformController.getPlatformBalance );

// Mettre à jour le solde de la plateforme (administrateurs seulement)
router.put('/update-platform-balance', protect, platformController.updatePlatformBalance);

// Réinitialiser le solde de la plateforme (administrateurs seulement)
router.post('/reset-platform-balance', protect, platformController.resetPlatformBalance);

// Route pour mettre à jour les limites d'achat
router.put('/update-purchase-limits', protect,auditLogger, platformController.updatePurchaseLimits);
// Route pour obtenir les limites actuelles d'achat
router.get('/limits', protect,  platformController.getLimits);
// Routes pour les limites de vente
router.put('/update-sale-limits', protect, auditLogger, platformController.updateSaleLimits);
// Route pour obtenir les limites actuelles d'achat
router.get('/details', protect,  platformController.getPlatformDetails);

// Route pour récupérer les frais d'enchère
router.get('/auction-get', protect,  platformController.getAuctionFee);

// Route pour mettre à jour les frais d'enchère (réservée à l'admin)
router.patch('/auction-fee', protect, auditLogger, platformController.updateAuctionFee);
module.exports = router;



