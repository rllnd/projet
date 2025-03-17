const express = require('express');
const  paymentController  = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/purchase1', protect, paymentController.purchaseGTC);
// Route pour récupérer l'historique des transactions
router.get('/history', protect, paymentController.getTransactionHistory);
router.post('/sell', protect, paymentController.sellGTC);

module.exports = router;
