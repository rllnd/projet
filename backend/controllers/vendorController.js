const User = require('../models/User'); // Importez le modèle User
const Article = require('../models/Article');
const Auction = require('../models/Auction');
const Notification = require ('../models/Notifications');
exports.getVendorOverview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const sellerId = req.user.role === 'seller' ? req.user.id : req.query.sellerId;

    if (!sellerId) {
      return res.status(400).json({ message: "L'ID du vendeur est requis." });
    }

    // Récupérer les articles associés au vendeur
    const articlesCount = await Article.count({ where: { sellerId } });

    // Récupérer les enchères à partir des articles
    const auctions = await Auction.findAll({
      include: [{
        model: Article,
        as: 'articleDetails',
        where: { sellerId },
      }],
    });

    const auctionsStopped = auctions.filter(a => a.status === 'closed').length;
    const activeAuctions = auctions.filter(a => a.status === 'open').length;
    const cancelledAuctions = auctions.filter(a => a.status === 'cancelled').length;
    const allAuctions = auctions.length;

    // Récupérer l'historique des enchères
    const auctionHistory = await Auction.count({
      include: [{
        model: Article,
        as: 'articleDetails',
        where: { sellerId },
      }],
    });

    // Récupérer l'historique des ventes
    const salesHistory = await Auction.sum('price', {
      where: {
        status: 'sold',
        '$articleDetails.sellerId$': sellerId,
      },
      include: [{
        model: Article,
        as: 'articleDetails',
      }],
    });

    // Récupérer le solde du portefeuille
    const user = await User.findOne({ where: { id: sellerId } });
    const tokenBalance = user ? user.tokenBalance : 0;

    // Récupérer les notifications non lues
    const notifications = await Notification.count({ where: { userId: sellerId, isRead: false } });

    // Envoyer les résultats
    res.status(200).json({
      success: true,
      data: {
        articles: articlesCount,
        auctionsStopped,
        activeAuctions,
        cancelledAuctions,
        allAuctions,
        auctionHistory,
        salesHistory: salesHistory || 0,
        notifications,
        portfolio: tokenBalance, // Ajout du solde du portefeuille
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'aperçu du vendeur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};