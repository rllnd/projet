const express = require('express');
const router = express.Router();
const ConverRateController= require('../controllers/ConverRateController');
const { protect} = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditLogger'); 

// Route pour récupérer le taux de conversion
router.get('/rate',protect, ConverRateController.getConversionRate);

// Route pour mettre à jour le taux de conversion (seulement pour l'administrateur)
router.put('/update',protect,auditLogger,  ConverRateController.updateConversionRate);

// Route pour récupérer l'historique des taux de conversion
router.get("/history", protect, ConverRateController.getConversionRateHistory );
// route pour récupérer l'historique des taux de conversion dans 5 jours 
router.get("/recent", protect, ConverRateController.getRecentConversionRates);



module.exports = router;
