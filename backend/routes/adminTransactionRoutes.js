const express = require('express');
const router = express.Router();
const adminTransactionController = require('../controllers/adminTransactionController');
const { protect } = require('../middleware/authMiddleware');

// Route pour les historiques journaliers/mensuels/annuels
router.get('/transactions/history',protect,  adminTransactionController.getAdminTransactionHistory);

// Route pour tous les détails des transactions
router.get('/transactions/details',protect,  adminTransactionController.getAllTransactionDetails);

module.exports = router;
