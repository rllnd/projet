const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin');
const { protect } = require('../middleware/authMiddleware');
const {admin} = require('../middleware/adminMiddleware');
const articleController = require('../controllers/articleController');
const auctionController = require('../controllers/auctionController');

// Route de connexion pour le Super Admin
router.post('/login',superadminController.loginSuperAdmin);

router.get('/platform-balance', protect,admin, superadminController.getPlatformBalance);


// Route pour obtenir tous les utilisateurs (admin seulement)
router.get('/users', protect,admin, superadminController.getAllUsers);

// Route pour récupérer les articles en attente
router.get('/articles/pending', protect,admin, articleController.getPendingArticles);

// Route pour approuver un utilisateur (admin seulement)
//router.put('/approve-user/:id',protect,admin, superadminController.approveUser);

// Route pour désactiver un utilisateur (admin seulement)
router.put('/deactivate-user/:id',protect,admin, superadminController.deactivateUser);

// Route pour récupérer les articles en attente
//router.get('/articles/pending', protect, admin, articleController.getPendingArticles);

router.put('/articles/:articleId/approve',protect,admin,articleController.approveArticle);

router.get('/articles/my-articles',protect,admin,articleController.getSellerArticles);

// Route pour publier un article (admin seulement)
router.put('/articles/:articleId/publish', protect, admin, articleController.publishArticle);
router.put('/stop/:auctionId', protect, admin, auctionController.stopAuction);
router.put('/auctions/cancel/:auctionId', protect, admin, auctionController.cancelAuction);
router.get('/admin/all', protect, admin, auctionController.getAllAuctionsAdmin);



module.exports = router;
