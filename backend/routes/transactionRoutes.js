const express = require('express');
//const { initiateAirtelPayment, } = require('../controllers/transactionController');
{/*const {
  createTokenPurchaseTransaction,
  createAuctionPaymentTransaction,
  getUserTransactions,
} = require('../controllers/transactionController');*/}
//const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route pour l'achat de tokens
//router.post('/purchase', protect, createTokenPurchaseTransaction);

// Route pour le paiement lors d'une enchère
//router.post('/auction-payment', protect, createAuctionPaymentTransaction);

// Route pour récupérer les transactions d'un utilisateur
//router.get('/user/:userId', protect,  getUserTransactions);


// Route pour l'achat de tokens
router.post('/purchase',transactionController.purchaseTokens);
// Route pour initier un paiement
//router.post('/purchase',protect, initiateAirtelPayment);

module.exports = router;
