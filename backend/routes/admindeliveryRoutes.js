const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getAllDeliveries,
    getDeliveryDetails
} = require('../controllers/adminDeliveryController');

const router = express.Router();

// ✅ Liste des livraisons avec filtres (Ex: ?status=shipped)
router.get('/deliveries', protect, getAllDeliveries);

// ✅ Voir les détails d'une livraison spécifique
router.get('/deliveries/:deliveryId', protect, getDeliveryDetails);

module.exports = router;
