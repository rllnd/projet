const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Article = require('../models/Article');
const User = require('../models/User');
const notificationController = require('./notificationController');
const { Op } = require('sequelize');

// Créer une enchère
exports.createAuction = async (req, res) => {
  const { articleId, endDate } = req.body;

  try {
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article non trouvé." });
    }

    if (!article.isApproved) {
      return res.status(400).json({ message: "L'article doit être approuvé avant d'être mis en enchère." });
    }

    if (article.isAuctioned) {
      return res.status(400).json({ message: "Cet article est déjà en enchère." });
    }

    const auction = await Auction.create({
      articleId,
      startPrice: article.price,
      currentHighestBid: article.price,
      endDate: endDate || article.endDate,
      status: 'open',
    });

    article.isAuctioned = true;
    await article.save();

    res.status(201).json({ message: "L'enchère a été créée avec succès.", auction });
  } catch (error) {
    console.error("Erreur lors de la création de l'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


exports.placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    const userId = req.user.id;

    const auction = await Auction.findByPk(auctionId);

    if (!auction || auction.status !== 'open') {
      return res.status(400).json({ message: "Enchère non disponible." });
    }

    
    if (bidAmount <= auction.currentHighestBid) {
      return res.status(400).json({ message: "Le montant doit être supérieur à l'offre actuelle." });
    }

    const bid = await Bid.create({
      auctionId,
      userId,
      amount: bidAmount,
      bidTime: new Date(),
    });
    


    auction.currentHighestBid = bidAmount;
    auction.highestBidUserId = userId;
    await auction.save();

    res.status(200).json({ message: "Enchère placée avec succès.", bid, auction });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


// Récupérer les enchères actives pour les vendeurs et les administrateurs
exports.getActiveAuctions = async (req, res) => {
  try {
    const { id: userId, isAdmin } = req.user;

    const filter = isAdmin
      ? { status: 'open' }
      : { status: 'open', '$articleDetails.sellerId$': userId };

    const auctions = await Auction.findAll({
      where: filter,
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'category', 'price', 'endDate', 'sellerId'],
        },
      ],
      order: [['endDate', 'ASC']],
    });

    res.status(200).json(auctions);
  } catch (error) {
    console.error("Erreur lors de la récupération des enchères actives :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Arrêter une enchère
exports.stopAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Article,
          as: 'articleDetails',
          include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!auction || auction.status !== 'open') {
      return res.status(400).json({ message: "Enchère non disponible ou déjà fermée." });
    }

    auction.status = 'closed';
    await auction.save();

    // Créer une notification pour le vendeur
    const sellerId = auction.articleDetails.seller.id;
    await Notification.create({
      userId: sellerId,
      message: `Votre enchère pour l'article "${auction.articleDetails.name}" a été arrêtée par un administrateur.`,
    });

    res.status(200).json({ message: "L'enchère a été arrêtée avec succès.", auction });
  } catch (error) {
    console.error("Erreur lors de l'arrêt de l'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Annuler une enchère
exports.cancelAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { reason } = req.body;

    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Article,
          as: 'articleDetails',
          include: [{ model: User, as: 'seller' }],
        },
      ],
    });

    if (!auction || auction.status !== 'open') {
      return res.status(400).json({ message: 'Enchère non disponible ou déjà fermée.' });
    }

    // Mettre à jour l'état de l'enchère
    auction.status = 'cancelled';
    auction.cancellationReason = reason;
    await auction.save();

    // Créer une notification pour le vendeur
    const sellerId = auction.articleDetails.seller.id;
    const notificationMessage = `Votre enchère pour l'article "${auction.articleDetails.name}" a été annulée. Raison : ${reason}`;
    await notificationController.createNotification(sellerId, notificationMessage);

    res.status(200).json({ message: 'L\'enchère a été annulée avec succès.', auction });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'enchère :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


// Récupérer les enchères fermées
exports.getClosedAuctions = async (req, res) => {
  try {
    const closedAuctions = await Auction.findAll({
      where: { status: 'closed' },
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'category', 'price', 'endDate', 'sellerId'],
        },
      ],
      order: [['endDate', 'DESC']],
    });

    res.status(200).json(closedAuctions);
  } catch (error) {
    console.error("Erreur lors de la récupération des enchères fermées :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Récupérer toutes les enchères pour l'administrateur
exports.getAllAuctionsAdmin = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé : réservé aux administrateurs' });
    }

    const auctions = await Auction.findAll({
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'category', 'price', 'endDate', 'sellerId'],
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'name', 'email'], // Détails du vendeur
            },
          ],
        },
        {
          model: Bid,
          as: 'bids',
          attributes: ['id', 'amount', 'bidTime'],
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name', 'email'], // Détails des enchérisseurs
            },
          ],
        },
      ],
      order: [['endDate', 'ASC']],
    });

    res.status(200).json(auctions);
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères administratives :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Récupérer les enchères annulées
exports.getCancelledAuctions = async (req, res) => {
  try {
    const sellerId = req.user.id; // ID du vendeur connecté

    const cancelledAuctions = await Auction.findAll({
      where: { status: 'cancelled' },
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'category', 'price'],
          where: { sellerId }, // Filtrer par l'ID du vendeur
        },
      ],
      order: [['updatedAt', 'DESC']], // Trier par la date de mise à jour
    });

    res.status(200).json(cancelledAuctions);
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères annulées pour le vendeur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
// auctionController.js
exports.finalizeAuction = async (auctionId) => {
  try {
    const auction = await Auction.findByPk(auctionId, {
      include: [
        { model: Article, as: 'articleDetails' },
        { model: Bid, as: 'bids' }, // Inclure les enchères liées
      ],
    });

    if (!auction || auction.status !== 'open') {
      console.error('Impossible de finaliser une enchère non ouverte.');
      return;
    }

    // Clôturer l'enchère
    auction.status = 'closed';
    auction.finalizedAt = new Date();
    await auction.save();

    const winner = await User.findByPk(auction.highestBidUserId);
    if (!winner) {
      console.error(`Aucun gagnant valide pour l'enchère ${auctionId}.`);
      return;
    }

    // Marquer l'article comme vendu
    const article = await Article.findByPk(auction.articleId);
    if (article) {
      article.isSold = true;
      article.soldTo = winner.id;
      await article.save();
    }

    // Remboursement des tokens pour les perdants
    const refunds = {};
    for (const bid of auction.bids) {
      if (bid.userId !== auction.highestBidUserId) {
        if (!refunds[bid.userId]) refunds[bid.userId] = 0;
        refunds[bid.userId] += bid.amount; // Ajouter le montant à rembourser
      }
    }

    for (const [userId, refundAmount] of Object.entries(refunds)) {
      const user = await User.findByPk(userId);
      if (user) {
        user.tokenBalance += refundAmount;
        await user.save();

        // Notification pour les perdants
        await Notification.create({
          userId,
          message: `Vous avez été remboursé de ${refundAmount} GTC pour l'enchère de "${auction.articleDetails.name}".`,
        });
      }
    }

    // Notification pour le gagnant
    await Notification.create({
      userId: winner.id,
      message: `Félicitations ! Vous avez remporté l'enchère pour "${auction.articleDetails.name}" avec un montant de ${auction.currentHighestBid} GTC.`,
    });

    console.log(`Enchère ${auctionId} finalisée. Gagnant: ${winner.name}, montant déduit: ${auction.currentHighestBid}.`);
  } catch (error) {
    console.error("Erreur lors de la finalisation de l'enchère :", error);
  }
};






