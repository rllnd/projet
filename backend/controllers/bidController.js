const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const User = require('../models/User');
const Article = require('../models/Article');
const Notification = require('../models/Notifications');

exports.placeManualBid = async (req, res) => {
  try {
    const { articleId, bidAmount } = req.body; // Récupérez l'ID de l'article et le montant de l'enchère
    const userId = req.user.id;

    console.log("Article ID reçu :", articleId);
    console.log("Montant de l'enchère :", bidAmount);

    // Trouver l'article et l'enchère associée
    const article = await Article.findByPk(articleId, {
      include: [{ model: Auction, as: 'auctionDetails' }],
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    const auction = article.auctionDetails; // Récupérer les détails de l'enchère
    if (!auction) {
      return res.status(404).json({ message: 'Aucune enchère associée à cet article.' });
    }

    if (auction.status !== 'open') {
      return res.status(400).json({ message: 'Enchère fermée ou non disponible.' });
    }

    if (auction.highestBidUserId === userId) {
      return res.status(400).json({ message: "Vous êtes déjà le plus offrant." });
    }

    if (bidAmount <= auction.currentHighestBid) {
      return res.status(400).json({ message: "Le montant doit être supérieur à l'offre actuelle." });
    }

    // Vérifiez si l'utilisateur participe pour la première fois
    const existingBid = await Bid.findOne({
      where: { auctionId: auction.id, userId },
    });

    const isFirstParticipation = !existingBid; // Pas d'enchère précédente

    // Mettez également à jour le prix de l'article
    article.price = bidAmount;
    await article.save();

    // Créez une nouvelle enchère manuelle
    const bid = await Bid.create({
      auctionId: auction.id,
      userId,
      amount: bidAmount,
      bidTime: new Date(),
      isAutoBid: false, // C'est une enchère manuelle
    });

    // Mettez à jour les informations de l'enchère
    auction.currentHighestBid = bidAmount;
    auction.highestBidUserId = userId;
    await auction.save();

    // Si c'est la première participation, créez une notification
    if (isFirstParticipation) {
      await Notification.create({
        userId,
        message: `Félicitations, vous participez maintenant à l'enchère pour "${article.name}" !`,
        isRead: false,
      });
    }

    // Appeler `processAutoBid` pour traiter les enchères automatiques
    const autoBidResult = await exports.processAutoBid(auction.id);

    // Vérifiez si les enchères automatiques sont épuisées
    const autoBidMessage = autoBidResult
      ? autoBidResult.message
      : 'Aucune enchère automatique n’a été activée.';

    res.status(200).json({
      message: 'Enchère placée avec succès.',
      autoBidMessage,
      auction: {
        id: auction.id,
        articleId: article.id,
        currentHighestBid: auction.currentHighestBid,
        highestBidUserId: auction.highestBidUserId,
        status: auction.status,
      },
      bid,
      isFirstParticipation,
    });
  } catch (error) {
    console.error("Erreur lors de la soumission de l'enchère :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.placeAutoBid = async (req, res) => {
  try {
    const { articleId, maxBidAmount } = req.body; // Récupérez l'ID de l'article et le montant maximum
    const userId = req.user.id;

    // Trouver l'article et l'enchère associée
    const article = await Article.findByPk(articleId, {
      include: [{ model: Auction, as: 'auctionDetails' }],
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    const auction = article.auctionDetails;
    if (!auction) {
      return res.status(404).json({ message: 'Aucune enchère associée à cet article.' });
    }

    if (auction.status !== 'open') {
      return res.status(400).json({ message: 'Enchère fermée ou non disponible.' });
    }

    if (auction.highestBidUserId === userId) {
      return res.status(400).json({ message: "Vous êtes déjà le plus offrant." });
    }

    if (maxBidAmount <= auction.currentHighestBid) {
      return res.status(400).json({ message: "Le montant maximal doit être supérieur à l'offre actuelle." });
    }

    const user = await User.findByPk(userId);
    if (!user || user.tokenBalance < maxBidAmount) {
      return res.status(400).json({ message: 'Fonds insuffisants.' });
    }

    // Déduisez les fonds du solde utilisateur
    user.tokenBalance -= maxBidAmount;
    await user.save();

    // Vérifiez si l'utilisateur participe pour la première fois
    const existingBid = await Bid.findOne({
      where: { auctionId: auction.id, userId },
    });

    const isFirstParticipation = !existingBid;

    // Stockez le maxAutoBid dans l'enchère
    auction.maxAutoBid = maxBidAmount;
    await auction.save();

    // Créez une enchère automatique
    await Bid.create({
      auctionId: auction.id,
      userId,
      amount: maxBidAmount,
      isAutoBid: true,
      bidTime: new Date(),
    });

    // Si c'est la première participation, créez une notification
    if (isFirstParticipation) {
      await Notification.create({
        userId,
        message: `Félicitations, vous participez maintenant à l'enchère pour "${article.name}" !`,
        isRead: false,
      });
    }

    // Appeler `processAutoBid` pour gérer immédiatement les enchères automatiques
    const autoBidResult = await exports.processAutoBid(auction.id);

    res.status(200).json({
      message: 'Enchère automatique activée avec succès.',
      autoBidResult,
      isFirstParticipation,
    });
  } catch (error) {
    console.error("Erreur lors de l'activation de l'enchère automatique :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.processAutoBid = async (auctionId) => {
  try {
    const auction = await Auction.findByPk(auctionId, {
      include: [{ model: Article, as: 'articleDetails' }],
    });

    if (!auction || auction.status !== 'open') return { message: 'Enchère non disponible.' };

    // Récupérez toutes les enchères automatiques classées par montant décroissant
    const autoBids = await Bid.findAll({
      where: { auctionId, isAutoBid: true },
      order: [['amount', 'DESC']],
    });

    for (const autoBid of autoBids) {
      if (autoBid.userId !== auction.highestBidUserId) {
        const nextBid = auction.currentHighestBid + 1;

        if (nextBid <= autoBid.amount) {
          // Créez une nouvelle enchère automatique
          await Bid.create({
            auctionId,
            userId: autoBid.userId,
            amount: nextBid,
            bidTime: new Date(),
            isAutoBid: true,
          });

          // Mettez à jour l'enchère et l'article
          auction.currentHighestBid = nextBid;
          auction.highestBidUserId = autoBid.userId;
          await auction.save();

          const article = await Article.findByPk(auction.articleId);
          if (article) {
            article.price = nextBid;
            await article.save();
          }

          // Appelez récursivement pour continuer à traiter les enchères automatiques
          return await exports.processAutoBid(auctionId);
        }
      }
    }

    return { message: 'Toutes les enchères automatiques ont été épuisées.' };
  } catch (error) {
    console.error('Erreur lors de la gestion des enchères automatiques :', error);
    return { message: 'Erreur lors de la gestion des enchères automatiques.' };
  }
};






exports.getParticipatingBids = async (req, res) => {
  try {
    const userId = req.user.id;

    const participatingBids = await Bid.findAll({
      where: { userId },
      include: [
        {
          model: Auction,
          as: 'auction',
          where: { status: 'open' },
          include: [
            {
              model: Article,
              as: 'articleDetails',
              attributes: ['id', 'name', 'endDate'], // Inclure `id` explicitement
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = participatingBids.map((bid) => ({
      id: bid.auction.id, // ID de l'enchère
      articleDetails: bid.auction.articleDetails,
      yourBid: bid.amount,
      highestBid: bid.auction.currentHighestBid,
      endDate: bid.auction.endDate,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères participées :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};




