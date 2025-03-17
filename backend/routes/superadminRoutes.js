const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin');
const { protect } = require('../middleware/authMiddleware');
const {admin} = require('../middleware/adminMiddleware');
const articleController = require('../controllers/articleController');
const auctionController = require('../controllers/auctionController');
const auditLogger = require('../middleware/auditLogger'); 
// Route de connexion pour le Super Admin
router.post('/login',superadminController.loginSuperAdmin);


// Route pour obtenir tous les utilisateurs (admin seulement)
router.get('/users', protect,admin, superadminController.getAllUsers);

// Route pour récupérer les articles en attente
router.get('/articles/pending', protect,admin, articleController.getPendingArticles);

// Route pour approuver un utilisateur (admin seulement)
//router.put('/approve-user/:id',protect,admin, superadminController.approveUser);

// Route pour désactiver un utilisateur (admin seulement)
router.put('/deactivate-user/:id',protect,admin, superadminController.deactivateUser);

//Approbation d'un article
router.put('/articles/:articleId/approve',protect,admin, auditLogger, articleController.approveArticle);

router.get('/articles/my-articles',protect,admin,articleController.getSellerArticles);

// Route pour publier un article (admin seulement)
router.put('/articles/:articleId/publish', protect, admin,auditLogger, articleController.publishArticle);
//arrêt d'une enchère manuelle
router.put('/stop/:auctionId', protect, admin,auditLogger, auctionController.stopAuction);
//Annulation d'une enchère
router.put('/auctions/cancel/:auctionId', protect, admin,auditLogger, auctionController.cancelAuction);
router.get('/admin/all', protect, admin, auctionController.getAllAuctionsAdmin);

//Suppression d'un utilisateur 
router.delete('/users/:id', protect, admin, auditLogger, superadminController.deleteInactiveUser);

module.exports = router;
