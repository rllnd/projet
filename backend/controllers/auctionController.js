const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Article = require('../models/Article');
const User = require('../models/User');
const notificationController = require('./notificationController');
const Notification = require('../models/Notifications');
const GTCTransaction = require('../models/GTCTransaction'); // Import du modèle GTCTransaction
const ConversionRate = require('../models/ConversionRate'); // Import du modèle ConversionRate
const Platform = require('../models/Platform'); // Import du modèle Platform
const Category = require ('../models/Category');
const sequelize = require('../config/db'); // ✅ Import de Sequelize
const Delivery = require ('../models/Delivery')
const AutoBid = require("../models/autobid"); // 🔥 Ajout nécessaire

// Envoyer via WebSocket
const { getIO } = require('../config/socket'); 
const { Op } = require('sequelize');


exports.createAuction = async (req, res) => {
  let transaction;

  try {
    transaction = await sequelize.transaction(); // ✅ Démarrer une transaction Sequelize

    const { articleId, endDate } = req.body;
    const sellerId = req.user.id;

    // ✅ Récupérer les frais d'enchère définis par l'administrateur
    const platform = await Platform.findOne({ transaction });

    if (!platform || !platform.auctionFee) {
      return res.status(500).json({ message: "Les frais d'enchère ne sont pas définis." });
    }

    const auctionFee = platform.auctionFee;

    // ✅ Vérification de l'article
    const article = await Article.findByPk(articleId, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'tokenBalance'] }],
      transaction,
    });

    if (!article) return res.status(404).json({ message: "Article non trouvé." });
    if (!article.isApproved) return res.status(400).json({ message: "L'article doit être approuvé avant d'être mis en enchère." });
    if (article.isAuctioned) return res.status(400).json({ message: "Cet article est déjà en enchère." });

    const seller = article.seller;
    if (!seller) return res.status(404).json({ message: "Vendeur introuvable." });

    // 🔍 Vérifier si le vendeur a assez de fonds
    if (seller.tokenBalance < auctionFee) {
      return res.status(400).json({ message: `Vous devez avoir au moins ${auctionFee} GTC pour mettre en enchère.` });
    }

    // ✅ Déduire les frais de mise en enchère
    seller.tokenBalance -= auctionFee;
    await seller.save({ transaction });

    // ✅ Ajouter les frais au solde de la plateforme
    platform.balance += auctionFee;
    await platform.save({ transaction });

    // ✅ Enregistrer la transaction GTC
    await GTCTransaction.create({
      userId: sellerId,
      type: 'fee',
      amount: auctionFee,
      description: `Frais de mise en enchère pour "${article.name}".`,
      isInternal: true,
      success: true,
      status: "completed",
    }, { transaction });

    // ✅ Création de l'enchère
    const auction = await Auction.create({
      articleId,
      startPrice: article.price,
      currentHighestBid: article.price,
      endDate: endDate || article.endDate,
      status: 'open',
    }, { transaction });

    article.isAuctioned = true;
    await article.save({ transaction });

    await transaction.commit(); // ✅ Valider la transaction

    // ✅ Enregistrer une notification pour le vendeur
    await Notification.create({
      userId: sellerId,
      message: `Votre article "${article.name}" a été mis en enchère avec succès. ${auctionFee} GTC ont été débités.`,
    });

    // ✅ WebSocket - Notifier en temps réel
    const io = getIO();
    io.emit("article-updated", { 
      id: article.id, 
      isAuctioned: true, 
      isApproved: true,
      seller: article.seller
    });

    io.emit("new-notification", {
      userId: sellerId,
      message: `Votre article "${article.name}" a été mis en enchère.`,
    });

    res.status(201).json({ message: `L'enchère a été créée avec succès. ${auctionFee} GTC ont été débités.` });

  } catch (error) {
    if (transaction) await transaction.rollback(); // ✅ Annuler en cas d'erreur
    console.error("Erreur lors de la mise en enchère :", error);
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
      where: { status: 'open' },
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'categoryId', 'price', 'endDate', 'sellerId'],
          include: [
            { model: Category, 
              as: 'category', 
              attributes: ['id', 'name'], 
              required: false 
            },
            { model: User, 
              as: 'seller',
               attributes: ['id', 'name']
           },
          ],
        },
        { model: User, 
          as: 'highestBidder',
           attributes: ['id', 'name', 'email'] 
        },
        {
          model: Bid,
          as: 'bids',
          include: [{ model: User,
             as: 'bidder',
              attributes: ['id', 'name', 'email'] 
            }],
          order: [['amount', 'DESC']],
          limit: 5,
        },
      ],
    });

    // ✅ Utilisation de Promise.all pour récupérer les enchérisseurs manquants
    const transformedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const sortedBids = auction.bids.sort((a, b) => b.amount - a.amount);

        let highestBidder = auction.highestBidder
          ? {
              id: auction.highestBidder.id,
              name: auction.highestBidder.name,
              email: auction.highestBidder.email,
            }
          : null;

        if (!highestBidder && auction.highestBidUserId) {
          highestBidder = await User.findByPk(auction.highestBidUserId, {
            attributes: ['id', 'name', 'email'],
          });
        }

        return {
          id: auction.id,
          status: auction.status,
          currentHighestBid: auction.currentHighestBid || 0,
          endDate: auction.endDate,
          articleDetails: {
            name: auction.articleDetails.name,
            category: auction.articleDetails.category
              ? auction.articleDetails.category.name
              : 'Catégorie non disponible',
            price: auction.articleDetails.price,
            endDate: auction.articleDetails.endDate,
            sellerId: auction.articleDetails.sellerId,
            seller: auction.articleDetails.seller // ✅ Ajout du vendeur ici
          },
          highestBidder: highestBidder
            ? {
                id: highestBidder.id,
                name: highestBidder.name,
                email: highestBidder.email,
              }
            : sortedBids.length > 0
            ? {
                id: sortedBids[0].bidder.id,
                name: sortedBids[0].bidder.name,
                email: sortedBids[0].bidder.email,
                bidAmount: sortedBids[0].amount,
              }
            : null,
          totalBids: auction.bids.length,
          bids: auction.bids.map((bid) => ({
            id: bid.id,
            amount: bid.amount,
            bidder: {
              id: bid.bidder.id,
              name: bid.bidder.name,
            },
          })),
        };
      })
    );

    res.status(200).json(transformedAuctions);
  } catch (error) {
    console.error("Erreur lors de la récupération des enchères actives :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};




// Arrêter une enchère manuellement
exports.stopAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    // Charger l'enchère avec les infos du vendeur et de l'article
    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Article,
          as: 'articleDetails',
          include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email', 'tokenBalance', 'escrowBalance'] }],
        },
        { model: Bid, as: 'bids' },
      ],
    });

    if (!auction || auction.status !== 'open') {
      return res.status(400).json({ message: "Enchère non disponible ou déjà fermée." });
    }

    // Fermer l'enchère
    auction.status = 'closed';
    auction.finalizedAt = new Date();
    await auction.save();

    const seller = auction.articleDetails.seller;
    const article = auction.articleDetails;

    if (!seller) {
      return res.status(400).json({ message: "Vendeur introuvable pour cette enchère." });
    }

    await Notification.create({
      userId: seller.id,
      message: `Votre enchère pour l'article "${article.name}" a été arrêtée.`,
    });

    let winner = null;

    // Gérer le gagnant
    if (auction.highestBidUserId) {
      winner = await User.findByPk(auction.highestBidUserId);

      if (winner) {
        article.isSold = true;
        article.soldTo = winner.id;
        article.price = auction.currentHighestBid;
        await article.save();

        const commissionRate = 0.1;
        const commission = auction.currentHighestBid * commissionRate;
        const reward = auction.currentHighestBid - commission;

        // Vérifier que le gagnant a assez de tokens
        if (winner.tokenBalance < auction.currentHighestBid) {
          return res.status(400).json({ message: "Solde insuffisant pour payer l'enchère." });
        }

        await winner.save();

        // Bloquer les fonds en escrow pour l'acheteur
        await GTCTransaction.create({
          userId: winner.id,
          auctionId: auction.id,
          type: "escrow",
          amount: reward,
          description: `Fonds bloqués pour l'achat de "${article.name}"`,
          status: "pending",
          isInternal: true,
          success: true,
        });

        // Bloquer les fonds en escrow pour le vendeur
        await GTCTransaction.create({
          userId: seller.id,
          auctionId: auction.id,
          type: "escrow",
          amount: reward,
          description: `Fonds bloqués pour la vente de "${article.name}"`,
          status: "pending",
          isInternal: true,
          success: true,
        });

        // Enregistrer la transaction de commission
        await GTCTransaction.create({
          userId: null,
          auctionId: auction.id,
          type: "commission",
          amount: commission,
          description: `Commission de la vente de "${article.name}".`,
          status: "completed",
          isInternal: true,
          success: true,
        });

        // Créer une entrée de livraison
        const delivery = await Delivery.create({
          auctionId: auction.id,
          buyerId: winner.id,
          sellerId: seller.id,
          status: "pending",
          address: winner.address,
          codeUnique: Math.random().toString(36).substr(2, 8),
        });

        // ✅ Notifier l'acheteur de son code unique
      await Notification.create({
        userId: winner.id,
        message: `Votre code unique pour la réception de "${article.name}" est : ${delivery.codeUnique}. Gardez-le précieusement.`,
      });

        console.log(`[INFO] 🔒 ${reward} GTC bloqués en Escrow Wallet pour ${winner.name}.`);
      }
    }

    const io = getIO();
    io.emit("auction-stopped", { id: auction.id });

    console.log(`🛑 Enchère arrêtée et mise à jour en temps réel : ${auction.id}`);

    res.status(200).json({ message: "Enchère arrêtée avec succès.", auction });
  } catch (error) {
    console.error("Erreur lors de l'arrêt de l'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};



exports.cancelAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { reason } = req.body;

    console.log(`🔍 Debug: Annulation de l'enchère ${auctionId}`);

    // ✅ Récupération de l'enchère avec toutes ses enchères associées
    const auction = await Auction.findByPk(auctionId, {
      include: [
        {
          model: Bid,
          as: 'bids',
          attributes: ['id', 'userId', 'amount', 'isAutoBid', 'createdAt', 'refunded'],
          order: [['createdAt', 'DESC']], // 🔥 Trier par date décroissante
        },
        {
          model: AutoBid,
          as: 'autoBids',
          attributes: ['id', 'userId', 'maxBidAmount'],
        },
        {
          model: GTCTransaction,
          as: 'transactions',
          attributes: ['id', 'auctionId', 'type', 'userId', 'amount', 'success'],
        },
      ],
    });

    if (!auction || auction.status !== 'open') {
      return res.status(400).json({ message: 'Enchère non disponible ou déjà fermée.' });
    }

    // ✅ Mettre à jour l'état de l'enchère
    auction.status = 'cancelled';
    auction.autoBidActive = false;  // ❌ Désactiver les AutoBids
    auction.cancellationReason = reason || 'Non spécifiée';
    await auction.save();

    console.log(`✅ Enchère ${auctionId} mise à jour en annulée et AutoBids désactivés.`);

    // ✅ Trouver la **dernière enchère active non remboursée**
    const lastBid = await Bid.findOne({
      where: {
        auctionId,
        userId: auction.highestBidUserId, // ✅ Celui qui a la plus haute enchère
        amount: auction.currentHighestBid, // ✅ Montant le plus élevé
        refunded: false, // ❌ Pas encore remboursé
      },
      order: [['createdAt', 'DESC']], // 🔥 Trier pour être sûr de prendre la plus récente
    });

    if (!lastBid) {
      console.log(`❌ Aucune mise active trouvée pour remboursement.`);
      return res.status(200).json({ message: "Aucune mise active à rembourser." });
    }

    console.log(`🔍 Dernière mise identifiée : UserID=${lastBid.userId}, Amount=${lastBid.amount}, AutoBid=${lastBid.isAutoBid}`);

    // ✅ Vérifier si cette mise a déjà été remboursée
    const alreadyRefunded = await GTCTransaction.findOne({
      where: {
        auctionId,
        userId: lastBid.userId,
        type: 'refund',
        amount: lastBid.amount,
        success: true,
      },
    });

    if (alreadyRefunded) {
      console.log(`❌ Cette mise a déjà été remboursée. Aucun remboursement à refaire.`);
      return res.status(200).json({ message: "Mise déjà remboursée." });
    }

    // ✅ Vérifier si l'utilisateur a un AutoBid actif
    const userAutoBid = auction.autoBids.find(autoBid => autoBid.userId === lastBid.userId);
    
    let refundAmount = lastBid.amount; // 🔥 Par défaut, on rembourse la dernière mise

    if (userAutoBid) {
      console.log(`🔍 AutoBid détecté : UserID=${userAutoBid.userId}, MaxBid=${userAutoBid.maxBidAmount}`);

      // ✅ Si l'AutoBid a atteint son maxBidAmount, rembourser tout
      if (lastBid.amount >= userAutoBid.maxBidAmount) {
        refundAmount = userAutoBid.maxBidAmount;
      }
    }

    console.log(`💰 Montant à rembourser pour UserID=${lastBid.userId} : ${refundAmount} GTC`);

    // ✅ Effectuer le remboursement
    const user = await User.findByPk(lastBid.userId);
    if (user) {
      user.tokenBalance += refundAmount;
      await user.save();

      lastBid.refunded = true;
      await lastBid.save();

      console.log(`✅ Solde mis à jour pour l'utilisateur ${user.id} (+${refundAmount} GTC)`);

      // ✅ Enregistrer la transaction de remboursement
      await GTCTransaction.create({
        userId: user.id,
        auctionId: auction.id,
        type: 'refund',
        amount: refundAmount,
        description: `Remboursement pour l'enchère annulée.`,
        isInternal: true,
        success: true,
        status: 'completed',
      });

      console.log(`✅ Transaction de remboursement créée pour ${user.id}`);

      // ✅ Notification pour l'utilisateur
      await Notification.create({
        userId: user.id,
        message: `Vous avez été remboursé de ${refundAmount} GTC pour l'enchère annulée.`,
      });

      console.log(`📩 Notification de remboursement envoyée à ${user.id}`);
    }

    // ✅ Supprimer tous les AutoBids après l'annulation
    await AutoBid.destroy({ where: { auctionId } });
    console.log(`✅ Tous les AutoBids pour l'enchère ${auctionId} ont été supprimés.`);

    // ✅ Diffusion WebSocket
    const io = getIO();
    io.emit("auction-cancelled", { id: auction.id });

    console.log(`🚫 Enchère annulée et mise à jour en temps réel : ${auctionId}`);

    res.status(200).json({
      message: "L'enchère a été annulée avec succès.",
      auction,
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'annulation de l'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
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
          attributes: ['name', 'categoryId', 'price', 'endDate', 'sellerId'],
          include: [
            {
              model: Category,
              as: 'category', // Alias défini dans la relation
              attributes: ['id', 'name'], // Ajoutez la colonne `name` pour le frontend
            },
            
          ],
        },
        {
          model: User,
          as: 'highestBidder',
          attributes: ['id', 'name', 'email'],
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
          attributes: ['name', 'categoryId', 'price', 'endDate', 'sellerId'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
              required: false,
            },
            {
              model: User, // ✅ Vérifie bien que cette ligne est présente
              as: 'seller', // ✅ Vérifie bien cet alias
              attributes: ['id', 'name', 'email'], // ✅ On récupère le vendeur
            },
          ],
        },
        {
          model: User,
          as: 'highestBidder',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Bid,
          as: 'bids',
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name', 'email'],
            },
          ],
          order: [['amount', 'DESC']],
          limit: 5,
        },
      ],
      order: [['endDate', 'ASC']],
    });

    // ✅ Vérification et récupération des données manquantes
    const transformedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        let highestBidder = auction.highestBidder || null;

        // ✅ Vérifier si `highestBidUserId` existe mais que `highestBidder` est null
        if (!highestBidder && auction.highestBidUserId) {
          highestBidder = await User.findByPk(auction.highestBidUserId, {
            attributes: ['id', 'name', 'email'],
          });
        }

        return {
          id: auction.id,
          status: auction.status,
          currentHighestBid: auction.currentHighestBid || 0,
          endDate: auction.endDate,
          articleDetails: {
            name: auction.articleDetails.name,
            category: auction.articleDetails.category
              ? auction.articleDetails.category.name
              : 'Catégorie non disponible',
            price: auction.articleDetails.price,
            endDate: auction.articleDetails.endDate,
            sellerId: auction.articleDetails.sellerId,
            seller: auction.articleDetails.seller // ✅ Ajout du vendeur ici
          },
          highestBidder: highestBidder
            ? {
                id: highestBidder.id,
                name: highestBidder.name,
                email: highestBidder.email,
              }
            : auction.bids.length > 0
            ? {
                id: auction.bids[0].bidder.id,
                name: auction.bids[0].bidder.name,
                email: auction.bids[0].bidder.email,
                bidAmount: auction.bids[0].amount,
              }
            : null,
          totalBids: auction.bids.length,
          bids: auction.bids.map((bid) => ({
            id: bid.id,
            amount: bid.amount,
            bidder: {
              id: bid.bidder.id,
              name: bid.bidder.name,
            },
          })),
        };
      })
    );
    
    res.status(200).json(transformedAuctions);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des enchères administratives :', error);
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
          attributes: ['name', 'categoryId', 'price','startprice'],
          include: [
            {
              model: Category,
              as: 'category', // Alias défini dans la relation
              attributes: ['id', 'name'], // Ajoutez la colonne `name` pour le frontend
            },
          ],
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
exports.finalizeAuction = async (req, res) => {
  try {
    const articleId = parseInt(req.params.auctionId, 10);

    if (isNaN(articleId)) {
      return res.status(400).json({ message: "ID d'article invalide." });
    }

    const auction = await Auction.findOne({
      where: { articleId, status: 'open' },
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['id', 'name', 'isSold', 'sellerId'],
        },
        {
          model: Bid,
          as: 'bids',
        },
        {
          model:GTCTransaction,
          as:'transactions',
          attributes:['id','auctionId','type']
        },
      ],
    });

    if (!auction) {
      return res.status(404).json({ message: "Enchère non ouverte ou introuvable pour cet article." });
    }

    const article = auction.articleDetails;

    if (article.isSold) {
      return res.status(400).json({ message: "L'article est déjà vendu." });
    }

    const winner = await User.findByPk(auction.highestBidUserId);
    if (!winner) {
      return res.status(404).json({ message: "Aucun gagnant trouvé pour cette enchère." });
    }

    // Gestion des fonds réservés pour l'offre gagnante
    const winningBid = auction.bids.find(
      (bid) => bid.userId === winner.id && bid.amount === auction.currentHighestBid && bid.reserved
    );

    if (winningBid) {
      winningBid.reserved = false; // Libérer les fonds réservés
      await winningBid.save();
    } else {
      if (winner.tokenBalance < auction.currentHighestBid) {
        return res.status(400).json({ message: "Le gagnant n'a pas suffisamment de jetons." });
      }

      winner.tokenBalance -= auction.currentHighestBid;
      await winner.save();
    }

    // Calcul des montants
    const commissionRate = 0.1;
    const commission = auction.currentHighestBid * commissionRate;
    const reward = auction.currentHighestBid - commission;

    // Transactions pour le gagnant
    await GTCTransaction.create({
      userId: winner.id,
      auctionId: auction.id,
      type: 'spend',
      amount: auction.currentHighestBid,
      description: `Déduction pour l'achat de l'article "${article.name}"`,
      operator: "Platform",
      phoneNumber: winner.phoneNumber || "0000000000",
      isInternal: false,
      success: true,
    });

    // Ajouter la récompense au vendeur
    const seller = await User.findByPk(article.sellerId);
    if (seller) {
      seller.tokenBalance += reward;
      await seller.save();

      // Transaction pour le vendeur
      await GTCTransaction.create({
        userId: seller.id,
        type: 'reward',
        amount: reward,
        description: `Revenu de la vente de l'article "${article.name}" après déduction de la commission.`,
        isInternal: true,
        success: true,
      });
    }

    // Ajouter la commission à la plateforme
    const platform = await Platform.findOne();
    if (platform) {
      platform.balance += commission;
      await platform.save();

      await GTCTransaction.create({
        userId: null,
        type: 'commission',
        amount: commission,
        description: `Commission de la plateforme pour l'article "${article.name}".`,
        isInternal: true,
        success: true,
      });
    }

    // Mettre à jour l'article et l'enchère
    article.isSold = true;
    article.soldTo = winner.id;
    await article.save();

    auction.status = 'closed';
    auction.finalizedAt = new Date();
    await auction.save();

    // Notifications
    await Notification.create({
      userId: winner.id,
      message: `Félicitations ! Vous avez remporté l'enchère pour "${article.name}".`,
    });

    if (seller) {
      await Notification.create({
        userId: seller.id,
        message: `Votre article "${article.name}" a été vendu pour ${auction.currentHighestBid} GTC. Vous avez reçu ${reward} GTC après déduction de la commission.`,
      });
    }

    res.status(200).json({ message: "Enchère finalisée avec succès.", auction });
  } catch (error) {
    console.error("Erreur lors de la finalisation de l'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.closeExpiredAuctions = async () => {
  try {
    const now = new Date();

    // Récupérer toutes les enchères expirées
    const expiredAuctions = await Auction.findAll({
      where: {
        status: 'open',
        endDate: { [Op.lt]: now },
      },
      include: [
        { model: Article, as: 'articleDetails', include: [{ model: User, as: 'seller' }] },
        { model: Bid, as: 'bids' },
      ],
    });

    console.log(`🔎 Enchères expirées détectées : ${expiredAuctions.length}`);

    for (const auction of expiredAuctions) {
      auction.status = 'closed';
      auction.finalizedAt = now;
      await auction.save();

      const article = auction.articleDetails;
      const seller = article.seller;
      let winner = null;

      if (!seller) {
        console.error(`❌ Vendeur non trouvé pour l'enchère ${auction.id}`);
        continue;
      }

      if (auction.highestBidUserId) {
        winner = await User.findByPk(auction.highestBidUserId);
      }

      console.log(`🛑 Enchère ${auction.id} fermée automatiquement.`);

      await Notification.create({
        userId: seller.id,
        message: `Votre enchère pour l'article "${article.name}" a été arrêtée automatiquement.`,
      });

      // 🔥 Gestion du gagnant et du paiement du vendeur
      if (winner) {
        console.log(`🎉 Gagnant détecté pour l'enchère ${auction.id}: ID ${winner.id}`);

        // Marquer l'article comme vendu
        article.isSold = true;
        article.soldTo = winner.id;
        article.price = auction.currentHighestBid;
        await article.save();

        const commissionRate = 0.1;
        const commission = auction.currentHighestBid * commissionRate;
        const reward = auction.currentHighestBid - commission;

        // ✅ Vérifier que le gagnant a assez de tokens
        if (winner.tokenBalance < auction.currentHighestBid) {
          console.error(`❌ Solde insuffisant pour payer l'enchère ${auction.id}`);
          continue;
        }

        await winner.save();

        // ✅ Bloquer les fonds en escrow pour l'acheteur
        await GTCTransaction.create({
          userId: winner.id,
          auctionId: auction.id,
          type: "escrow",
          amount: reward,
          description: `Fonds bloqués pour l'achat de "${article.name}"`,
          status: "pending",
          isInternal: true,
          success: true,
        });

        // ✅ Bloquer les fonds en escrow pour le vendeur
        await GTCTransaction.create({
          userId: seller.id,
          auctionId: auction.id,
          type: "escrow",
          amount: reward,
          description: `Fonds bloqués pour la vente de "${article.name}"`,
          status: "pending",
          isInternal: true,
          success: true,
        });

        // ✅ Enregistrer la transaction de commission
        await GTCTransaction.create({
          userId: null,
          auctionId: auction.id,
          type: "commission",
          amount: commission,
          description: `Commission de la vente de "${article.name}".`,
          status: "completed",
          isInternal: true,
          success: true,
        });

        // ✅ Créer une entrée de livraison avec un code unique
        const delivery = await Delivery.create({
          auctionId: auction.id,
          buyerId: winner.id,
          sellerId: seller.id,
          status: "pending",
          address: winner.address,
          codeUnique: Math.random().toString(36).substr(2, 8),
        });

        // ✅ Notifier l'acheteur avec son code unique
        await Notification.create({
          userId: winner.id,
          message: `Votre code unique pour la réception de "${article.name}" est : ${delivery.codeUnique}. Gardez-le précieusement.`,
        });

        console.log(`[INFO] 🔒 ${reward} GTC bloqués en Escrow Wallet pour ${winner.name}.`);
      }

      // 🔥 Notifier en temps réel via WebSocket
      const io = getIO();
      io.emit("auction-ended", {
        id: auction.id,
        winnerId: winner ? winner.id : null,
        finalPrice: auction.currentHighestBid,
        message: winner
          ? `L'enchère ${auction.id} s'est terminée, gagnée par ${winner.id}`
          : `L'enchère ${auction.id} s'est terminée sans gagnant.`,
      });

      console.log(`✅ Événement "auction-ended" envoyé.`);
    }

    console.log(`✅ ${expiredAuctions.length} enchères expirées ont été fermées automatiquement.`);
  } catch (error) {
    console.error("❌ Erreur lors de la clôture des enchères expirées :", error);
  }
};


exports.stopInactiveAuctions = async () => {
  try {
    const now = new Date();
    const inactiveThreshold = new Date(now - 2 * 60 * 1000); // 30 minutes d'inactivité

    console.log(`⏳ Vérification des enchères inactives à ${now.toISOString()}`);

    // 🔍 Trouver toutes les enchères ouvertes où `lastBidTime` ET `lastAutoBidTime` sont inactifs
    const inactiveAuctions = await Auction.findAll({
      where: {
        status: "open",
        currentHighestBid: { [Op.ne]: null }, // ✅ Il faut au moins une mise
        highestBidUserId: { [Op.ne]: null }, // ✅ Un enchérisseur doit exister
        [Op.and]: [
          { 
            [Op.or]: [
              { lastBidTime: { [Op.lt]: inactiveThreshold } }, // ✅ Dernière mise manuelle trop ancienne
              { lastBidTime: null } // ✅ Aucune mise manuelle
            ] 
          },
          { 
            [Op.or]: [
              { lastAutoBidTime: { [Op.lt]: inactiveThreshold } }, // ✅ Dernier AutoBid trop ancien
              { lastAutoBidTime: null } // ✅ Aucun AutoBid
            ] 
          }
        ]
      },
      attributes: [
        "id",
        "status",
        "currentHighestBid",
        "highestBidUserId",
        "lastBidTime",
        "lastAutoBidTime", // 🔥 Ajout explicite de lastAutoBidTime
        "autoBidActive"
      ],
      include: [
        { model: Article, as: "articleDetails", include: [{ model: User, as: "seller" }] },
        { model: AutoBid, as: "autoBids", required: false, attributes: ["userId", "maxBidAmount"] },
        { model: Bid, as: "bids", required: false, order: [["createdAt", "DESC"]] }
      ]
    });
    
    
    
    console.log(`🔎 Enchères détectées comme inactives : ${inactiveAuctions.length}`);

    for (const auction of inactiveAuctions) {
      console.log(`🛑 Arrêt de l'enchère ${auction.id} - lastBidTime: ${auction.lastBidTime}, lastAutoBidTime: ${auction.lastAutoBidTime}`);

      const highestBidUserId = auction.highestBidUserId;

      // 🔥 Supprimer tous les AutoBids liés à cette enchère
      await AutoBid.destroy({ where: { auctionId: auction.id } });

      // ✅ Désactiver `autoBidActive`
      auction.autoBidActive = false;
      auction.status = "closed";
      auction.finalizedAt = now;
      await auction.save();

      console.log(`🛑 Enchère ${auction.id} clôturée après 30 minutes d'inactivité.`);

      if (highestBidUserId) {
        await Notification.create({
          userId: highestBidUserId,
          message: `L'enchère sur "${auction.articleDetails.name}" a été arrêtée automatiquement après 30 minutes d'inactivité.`,
        });
      }

      const article = auction.articleDetails;
      let winner = null;

      if (auction.highestBidUserId) {
        winner = await User.findByPk(auction.highestBidUserId);
      }

      // 🔥 Envoyer un événement WebSocket pour notifier en temps réel
      const io = getIO();
      io.emit("auction-ended", {
        id: auction.id,
        winnerId: highestBidUserId || null,
        finalPrice: auction.currentHighestBid,
        message: highestBidUserId
          ? `L'enchère ${auction.id} s'est terminée, gagnée par ${highestBidUserId}.`
          : `L'enchère ${auction.id} s'est terminée sans gagnant.`,
      });

      console.log(`✅ Événement "auction-ended" envoyé avec succès.`);

       // 🔥 GESTION DES TRANSACTIONS SI IL Y A UN GAGNANT
       if (winner) {
        const seller = article.seller;

        if (!seller) {
          console.error(`[ERROR] ❌ Vendeur non trouvé pour l'enchère ${auction.id}`);
          continue;
        }

        console.log(`[INFO] 🎉 Gagnant détecté : ${winner.id}`);

        const commissionRate = 0.1;
        const commission = auction.currentHighestBid * commissionRate;
        const reward = auction.currentHighestBid - commission;

        // ✅ Bloquer les fonds en escrow pour l'acheteur
        await GTCTransaction.create({
          userId: winner.id,
          auctionId: auction.id,
          type: "escrow",
          amount: auction.currentHighestBid,
          description: `Fonds bloqués pour l'achat de "${article.name}"`,
          status: "pending",
          isInternal: true,
          success: true,
        });

        // ✅ Bloquer les fonds en escrow pour le vendeur
        await GTCTransaction.create({
          userId: seller.id,
          auctionId: auction.id,
          type: "escrow",
          amount: reward,
          description: `Fonds bloqués pour la vente de "${article.name}"`,
          status: "pending",
          isInternal: true,
          success: true,
        });

        // ✅ Enregistrer la transaction de commission
        await GTCTransaction.create({
          userId: null,
          auctionId: auction.id,
          type: "commission",
          amount: commission,
          description: `Commission de la vente de "${article.name}".`,
          status: "completed",
          isInternal: true,
          success: true,
        });

        // ✅ Créer une entrée de livraison avec un code unique
        const delivery = await Delivery.create({
          auctionId: auction.id,
          buyerId: winner.id,
          sellerId: seller.id,
          status: "pending",
          address: winner.address,
          codeUnique: Math.random().toString(36).substr(2, 8),
        });

        // ✅ Notifier l'acheteur avec son code unique
        await Notification.create({
          userId: winner.id,
          message: `Votre code unique pour la réception de "${article.name}" est : ${delivery.codeUnique}. Gardez-le précieusement.`,
        });

        console.log(`[INFO] 🔒 ${reward} GTC bloqués en Escrow Wallet pour ${winner.name}.`);
      }
    }

    console.log(`✅ Fin du processus d'arrêt automatique.`);
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt des enchères inactives :", error);
  }
};




































// Récupérer les enchères gagnées par l'utilisateur
exports.getWonAuctions = async (req, res) => {
  try {
    const userId = req.user.id;

    const wonAuctions = await Auction.findAll({
      where: { status: 'closed', highestBidUserId: userId },
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'price', 'endDate', 'imgUrl'], // Ajoute 'imgUrl' pour la photo de l'article
          include: [
            {
              model: User, // Assurez-vous que c'est le bon modèle pour le vendeur
              as: 'seller', // Nom de l'association
              attributes: ['name', 'lastName', 'email', 'profilePicture', 'phone', 'address', 'cin'], // Inclure tous les détails nécessaires
            },
          ],
        },
      ],
      order: [['finalizedAt', 'DESC']],
    });

    // Transformez les données pour simplifier la structure
    const result = wonAuctions.map((auction) => ({
      id: auction.id,
      currentHighestBid: auction.currentHighestBid,
      endDate: auction.endDate || auction.finalizedAt, // Utilisez endDate si disponible
      articleName: auction.articleDetails?.name || 'Nom non disponible',
      imageUrl: auction.articleDetails?.imgUrl || '', // URL de l'image
      seller: {
        name: auction.articleDetails?.seller?.name || 'Nom non disponible',
        lastName: auction.articleDetails?.seller?.lastName || 'Nom non disponible',
        email: auction.articleDetails?.seller?.email || 'Email non disponible',
        profilePicture: auction.articleDetails?.seller?.profilePicture || '', // Photo de profil
        phone: auction.articleDetails?.seller?.phone || 'Téléphone non disponible',
        address: auction.articleDetails?.seller?.address || 'Adresse non disponible',
        cin: auction.articleDetails?.seller?.cin || 'CIN non disponible',
      },
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des enchères gagnées :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getSellerAuctions = async (req, res) => {
  try {
    const sellerId = req.user.id;

    if (!sellerId) {
      return res.status(400).json({ message: "ID du vendeur non défini" });
    }

    const auctions = await Auction.findAll({
      include: [
        {
          model: Article,
          as: 'articleDetails',
          where: { sellerId },
          attributes: ['id', 'name', 'categoryId', 'startPrice'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Bid,
          as: 'bids',
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
        {
          model: GTCTransaction,
          as: 'transactions',
          required: false, 
          attributes: ['id', 'type', 'amount', 'description', 'status', 'createdAt', 'userId'],
          where: {
            [Op.or]: [
                { type: "reward" }, // ✅ Afficher les paiements reçus
                { type: "commission" }, // ✅ Afficher les frais de commission
                { type: "escrow", status: { [Op.in]: ["pending", "completed"] } }, // ✅ Inclure escrow même après complétion
            ],
           },
        
        },
        {
          model: User,
          as: 'highestBidder',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // ✅ Vérifiez si la transaction appartient bien au vendeur en mémoire
    const transformedAuctions = auctions.map((auction) => {
      const relatedTransactions = auction.transactions.filter(
        (transaction) => transaction.userId === sellerId
      );

      return {
        id: auction.id,
        articleName: auction.articleDetails.name,
        articleCategory: auction.articleDetails.category?.name || 'Non spécifiée',
        startPrice: auction.articleDetails.startPrice,
        currentHighestBid: auction.currentHighestBid || 0,
        status: auction.status,
        reason: auction.cancellationReason || 'N/A',
        winner: auction.highestBidder
          ? {
              id: auction.highestBidder.id,
              name: auction.highestBidder.name,
              email: auction.highestBidder.email,
            }
          : null,
        totalBids: auction.bids.length,
        endDate: auction.endDate,
        duration: auction.endDate
          ? `${Math.floor((new Date(auction.endDate) - new Date(auction.createdAt)) / (1000 * 60 * 60))} heures`
          : `${Math.floor((new Date() - new Date(auction.createdAt)) / (1000 * 60 * 60))} heures`,
        transactions: relatedTransactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          date: transaction.createdAt,
        })) || [],
      };
    });

    res.status(200).json({
      success: true,
      data: transformedAuctions,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des enchères du vendeur :", error);
    res.status(500).json({
      message: "Erreur serveur.",
      errorDetails: error.message,
    });
  } 
};


// Récupérer les enchères annulées pour un utilisateur (acheteur)
exports.getCancelledAuctionsForBuyer = async (req, res) => {
  try {
    const buyerId = req.user.id; // ID de l'utilisateur connecté

    const cancelledAuctions = await Auction.findAll({
      where: { status: 'cancelled' },
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'categoryId', 'startPrice', 'price'],
          include: [
            {
              model: Category,
              as: 'category', // Alias défini dans la relation
              attributes: ['id', 'name'], // Inclure la catégorie
            },
          ],
        },
        {
          model: Bid, // Inclure les mises faites par l'utilisateur
          as: 'bids',
          where: { userId: buyerId }, // Filtrer uniquement les enchères où l'utilisateur a participé
          required: true, // Ne retourner que les enchères où il y a des mises
          attributes: ['id','amount', 'createdAt'], // Inclure les détails des mises
        },
      ],
      order: [['updatedAt', 'DESC']], // Trier par date de mise à jour
    });

    if (!cancelledAuctions.length) {
      return res.status(404).json({ message: 'Aucune enchère annulée trouvée.' });
    }

    // Structurer la réponse
    // Transformer les données pour inclure la dernière mise de l'utilisateur
    const transformedAuctions = cancelledAuctions.map((auction) => {
      const userBids = auction.bids || [];
      const lastBid = userBids.length > 0
        ? Math.max(...userBids.map((bid) => bid.amount)) // Dernière mise de l'utilisateur
        : null;

      return {
        id: auction.id,
        articleName: auction.articleDetails?.name || 'Non spécifié',
        startPrice: auction.articleDetails?.startPrice || 0,
        finalPrice: auction.articleDetails?.price || null,
        cancelReason: auction.cancellationReason || 'Non spécifiée',
        cancelDate: auction.updatedAt,
        lastBid, // Ajout de la dernière mise de l'utilisateur
      };
    });

    res.status(200).json(transformedAuctions);
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères annulées pour l\'acheteur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

//historique des enchères admin
exports.getAuctionHistory = async (req, res) => {
  try {
    const { status, startDate, endDate, articleName } = req.query;

    const auctionHistory = await Auction.findAll({
      where: {
        ...(status && { status }),
        ...(startDate && { finalizedAt: { [Op.gte]: new Date(startDate) } }),
        ...(endDate && { finalizedAt: { [Op.lte]: new Date(endDate) } }),
  
      },
      order: [['finalizedAt', 'DESC']],
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['id', 'name', 'shortDesc', 'imgUrl', 'categoryId', 'fullDesc'],
          include: [
            {
              model: Category,
              as: 'category', // Alias défini dans la relation
              attributes: ['id', 'name'], // Ajoutez la colonne `name` pour le frontend
            },
          ],
          
          where: articleName
          ? {
              name: {
                [Op.like]: `%${articleName}%`,
              },
            }
          : undefined,
          include: [
            {
              model: User,
              as: 'seller', // Inclure le vendeur via l'article
              attributes: ['id', 'name'], // Informations sur le vendeur
            }
          ],
        },
        {
          model: User,
          as: 'highestBidder',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Bid,
          as: 'bids',
          attributes: ['id', 'amount', 'userId', 'bidTime'],
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    const detailedHistory = auctionHistory.map((auction) => {
      const totalBids = auction.bids.length;
      const totalParticipants = [...new Set(auction.bids.map((bid) => bid.userId))].length;
      const totalAmount = auction.bids.reduce((sum, bid) => sum + bid.amount, 0);
      const averageBid = totalBids ? (totalAmount / totalBids).toFixed(2) : 0;

      return {
        auctionId: auction.id,
        status: auction.status,
        article: auction.articleDetails,
        finalPrice: auction.currentHighestBid,
        winner: auction.highestBidder || null,
        totalBids,
        totalParticipants,
        totalAmount,
        averageBid,
        auctionStartDate: auction.createdAt,
        auctionEndDate: auction.finalizedAt,
        duration: auction.finalizedAt
          ? Math.round((auction.finalizedAt - auction.createdAt) / 1000 / 60) + ' minutes'
          : null,
        cancellationReason: auction.cancellationReason || 'N/A', // Raison d'annulation
        seller: auction.articleDetails.seller || null, // Informations sur le vendeur
      };
    });

    // Réponse avec les données enrichies
    res.status(200).json({
      success: true,
      message: 'Historique des enchères récupéré avec succès.',
      data: detailedHistory,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Récupérer les statistiques des enchères
exports.getAuctionStatistics = async (req, res) => {
  try {
    // Récupérer toutes les enchères finalisées
    const finalizedAuctions = await Auction.findAll({
      where: {
        finalizedAt: { [Op.ne]: null }, // Récupérer uniquement celles qui sont finalisées
      },
    });

    // Calcul des statistiques
    const dailyStats = {};
    const monthlyStats = {};
    const annualStats = {};

    finalizedAuctions.forEach((auction) => {
      const date = new Date(auction.finalizedAt);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      const day = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

      // Statistiques journalières
      dailyStats[day] = (dailyStats[day] || 0) + auction.currentHighestBid;

      // Statistiques mensuelles
      monthlyStats[`${month} ${year}`] = (monthlyStats[`${month} ${year}`] || 0) + auction.currentHighestBid;

      // Statistiques annuelles
      annualStats[year] = (annualStats[year] || 0) + auction.currentHighestBid;
    });

    // Réponse avec les statistiques
    res.status(200).json({
      success: true,
      message: 'Statistiques des enchères récupérées avec succès.',
      daily: dailyStats,
      monthly: monthlyStats,
      annual: annualStats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des enchères :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};


//statistique des enchères côtés vendeurs
exports.getSellerAuctionStatistics = async (req, res) => {
  try {
    const sellerId = req.user.role === 'seller' ? req.user.id : req.query.sellerId; // ID du vendeur connecté ou fourni pour admin

    if (!sellerId) {
      return res.status(400).json({ message: "L'ID du vendeur est requis." });
    }

    // Filtrer par période
    const { period } = req.query; // Ex : daily, monthly, yearly
    let dateFilter = {};
    const now = new Date();
    if (period === 'daily') {
      dateFilter = { createdAt: { [Op.gte]: new Date(now.setHours(0, 0, 0, 0)) } };
    } else if (period === 'monthly') {
      dateFilter = { createdAt: { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1) } };
    } else if (period === 'yearly') {
      dateFilter = { createdAt: { [Op.gte]: new Date(now.getFullYear(), 0, 1) } };
    }

    // Définir les inclusions pour la relation entre Auction et Article
    const articleInclude = {
      model: Article,
      as: 'articleDetails',
      where: { sellerId }, // Filtrer par l'ID du vendeur
    };

    // Calculer les statistiques
    const created = await Auction.count({
      include: [articleInclude],
      where: { ...dateFilter }, // Inclure le filtre de date
    });

    const cancelled = await Auction.count({
      include: [articleInclude],
      where: {
        ...dateFilter,
        status: 'cancelled',
      },
    });

    const ongoing = await Auction.count({
      include: [articleInclude],
      where: {
        ...dateFilter,
        status: 'open', // Assurez-vous que ce statut correspond à votre base
      },
    });

    const stopped = await Auction.count({
      include: [articleInclude],
      where: {
        ...dateFilter,
        status: 'closed',
      },
    });

    // Envoyer les résultats
    res.status(200).json({
      success: true,
      data: {
        created,
        cancelled,
        ongoing,
        stopped,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};



//statistique des enchères côtés acheteurs
exports.getBuyerAuctionStatistics = async (req, res) => {
  try {
    const buyerId = req.user.id;

    if (!buyerId) {
      return res.status(400).json({ message: 'ID de l\'acheteur non défini.' });
    }

    const finalizedAuctions = await Auction.findAll({
      where: {
        finalizedAt: { [Op.ne]: null },
        highestBidderId: buyerId, // Filtre pour l'acheteur
      },
    });

    const dailyStats = {};
    const monthlyStats = {};
    const annualStats = {};

    finalizedAuctions.forEach((auction) => {
      const date = new Date(auction.finalizedAt);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      const day = date.toISOString().split('T')[0];

      dailyStats[day] = (dailyStats[day] || 0) + auction.currentHighestBid;
      monthlyStats[`${month} ${year}`] = (monthlyStats[`${month} ${year}`] || 0) + auction.currentHighestBid;
      annualStats[year] = (annualStats[year] || 0) + auction.currentHighestBid;
    });

    res.status(200).json({
      success: true,
      message: 'Statistiques pour l\'acheteur récupérées avec succès.',
      daily: dailyStats,
      monthly: monthlyStats,
      annual: annualStats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de l\'acheteur :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

//récupération des enchères arrêtées auto
exports.getStoppedAuctions = async (req, res) => {
  try {
    const { autoStopped } = req.query; // Paramètre pour différencier les enchères stoppées automatiquement

    const whereClause = {
      status: 'closed', // Seules les enchères fermées
    };

    // Si "autoStopped" est fourni, filtrez uniquement les enchères stoppées automatiquement
    if (autoStopped) {
      whereClause.finalizedAt = { [Op.ne]: null }; // Indique que l'enchère a été finalisée (date définie)
      whereClause.lastBidTime = {
        [Op.lt]: new Date(new Date() - 30 * 60 * 1000), // Par exemple : inactivité de plus de 30 minutes
      };
    }

    // Récupérer les enchères stoppées
    const stoppedAuctions = await Auction.findAll({
      where: whereClause,
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['id', 'name', 'categoryId', 'isSold', 'sellerId'],
          include: [
            {
              model: Category,
              as: 'category', // Alias défini dans la relation
              attributes: ['id', 'name'], // Ajoutez la colonne `name` pour le frontend
            },
          ],
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'name', 'email', 'tokenBalance'],
            },
          ],
        },
        {
          model: Bid,
          as: 'bids',
          attributes: ['id', 'amount', 'userId', 'bidTime', 'reserved'],
          include: [
            {
              model: User,
              as: 'bidder',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'highestBidder',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['finalizedAt', 'DESC']], // Tri par date de finalisation
    });

    if (!stoppedAuctions.length) {
      return res.status(404).json({ message: 'Aucune enchère stoppée trouvée.' });
    }

    // Formatage des données
    const formattedAuctions = stoppedAuctions.map((auction) => ({
      auctionId: auction.id,
      status: auction.status,
      finalizedAt: auction.finalizedAt,
      currentHighestBid: auction.currentHighestBid,
      reason: auction.lastBidTime ? 'Inactivité' : 'Arrêt manuel',
      lastBidTime: auction.lastBidTime,
      article: auction.articleDetails
        ? {
            id: auction.articleDetails.id,
            name: auction.articleDetails.name,
            category: auction.articleDetails.category,
            isSold: auction.articleDetails.isSold,
            seller: auction.articleDetails.seller || null,
          }
        : null,
      highestBidder: auction.highestBidder || null,
      bids: auction.bids.map((bid) => ({
        bidId: bid.id,
        amount: bid.amount,
        bidder: bid.bidder || null,
        bidTime: bid.bidTime,
        reserved: bid.reserved,
      })),
    }));

    res.status(200).json({
      success: true,
      message: 'Enchères stoppées récupérées avec succès.',
      data: formattedAuctions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères stoppées :', error);
    res.status(500).json({ message: 'Erreur serveur.', errorDetails: error.message });
  }
};

// auctionController.js
exports.getSellerStoppedAuctions = async (req, res) => {
  try {
    const sellerId = req.user.id; // ID du vendeur connecté

    if (!sellerId) {
      return res.status(400).json({ message: "ID du vendeur non défini." });
    }

    const stoppedAuctions = await Auction.findAll({
      where: { status: 'closed' }, // Récupérer les enchères stoppées
      include: [
        {
          model: Article,
          as: 'articleDetails',
          where: { sellerId }, // Filtrer les articles appartenant au vendeur
          attributes: ['id', 'name', 'categoryId', 'startPrice'],
          include: [
            {
              model: Category,
              as: 'category', // Alias défini dans la relation
              attributes: ['id', 'name'], // Ajoutez la colonne `name` pour le frontend
            },
          ],
        },
        {
          model: Bid,
          as: 'bids',
          attributes: ['id', 'amount', 'userId', 'bidTime'],
        },
      ],
    });

    // Récupérer les transactions liées au vendeur
    const sellerTransactions = await GTCTransaction.findAll({
      where: { userId: sellerId }, // Transactions liées au vendeur
      attributes: ['id', 'type', 'amount', 'description', 'createdAt', 'success'],
    });

    // Transformez les enchères en ajoutant les transactions correspondantes
    const transformedAuctions = stoppedAuctions.map((auction) => ({
      auctionId: auction.id,
      article: auction.articleDetails,
      category:auction.articleDetails?.category,
      currentHighestBid: auction.currentHighestBid || 0,
      reason: auction.cancellationReason || 'Inactivité',
      finalizedAt: auction.finalizedAt,
      totalBids: auction.bids.length,
      participants: new Set(auction.bids.map((bid) => bid.userId)).size,
      transactions: sellerTransactions.filter(
        (transaction) =>
          transaction.description &&
          transaction.description.includes(auction.articleDetails.name)
      ), // Filtrer les transactions liées à cette enchère
    }));

    res.status(200).json({
      success: true,
      data: transformedAuctions,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des enchères stoppées du vendeur :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

//enchères perdues acheteurs
exports.getExpiredAuctionsForBuyer = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur connecté

    const lostAuctions = await Auction.findAll({
      where: {
        status: 'closed', // L'enchère est terminée
        [Op.or]: [
          { highestBidUserId: { [Op.ne]: userId } }, // Un autre utilisateur a gagné
          { highestBidUserId: null }, // Aucun gagnant défini
        ],
      },
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['name', 'price','startPrice'], // Nom et prix de l'article
        },
        {
          model: Bid,
          as: 'bids',
          attributes: ['amount'], // Dernière mise de l'utilisateur
          where: { userId }, // Filtrer uniquement les offres de l'utilisateur
          required: true, // L'utilisateur doit avoir participé
        },
      ],
      order: [['finalizedAt', 'DESC']], // Trier par la date de clôture
    });

    res.status(200).json(lostAuctions);
  } catch (error) {
    console.error('Erreur lors de la récupération des enchères perdues :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getBuyerAuctionHistory = async (req, res) => {
  try {
    const buyerId = req.user.id;

    if (!buyerId) {
      return res.status(400).json({ message: "ID de l'acheteur non défini." });
    }

    const auctions = await Auction.findAll({
      include: [
        {
          model: Article,
          as: 'articleDetails',
          attributes: ['id', 'name', 'categoryId', 'startPrice'],
          include: [
            { model: Category, as: 'category', attributes: ['id', 'name'] },
            { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
          ],
        },
        {
          model: Bid,
          as: 'bids',
          where: { userId: buyerId },
          required: true,
          attributes: ['id', 'amount', 'createdAt', 'refunded'],
        },
        {
          model: GTCTransaction,
          as: 'transactions',
          attributes: ['id', 'type', 'amount', 'description', 'createdAt', 'auctionId', 'userId'],
        },
      ],
      where: { status: { [Op.or]: ['cancelled', 'closed'] } },
      order: [['finalizedAt', 'DESC']],
    });

    const transformedAuctions = auctions.map((auction) => {
      const isWon = auction.highestBidUserId === buyerId;
      const isCancelled = auction.status === 'cancelled';
      const isLost =
        auction.status === 'closed' &&
        (auction.highestBidUserId !== buyerId || auction.highestBidUserId === null );

      console.log(`Enchère ${auction.id} : isWon=${isWon}, isCancelled=${isCancelled}, isLost=${isLost}`);

      const relevantTransactions = auction.transactions.filter((transaction) => {
        if (isWon && transaction.type === 'spend') {
          return true;
        } else if ((isLost || isCancelled) && transaction.type === 'refund') {
          return transaction.userId === buyerId && transaction.auctionId === auction.id;
        }
        return false;
      });

      return {
        id: auction.id,
        articleName: auction.articleDetails.name,
        articleCategory: auction.articleDetails.category?.name || 'Non spécifiée',
        seller: auction.articleDetails.seller
          ? {
              id: auction.articleDetails.seller.id,
              name: auction.articleDetails.seller.name,
              email: auction.articleDetails.seller.email,
            }
          : null,
        startPrice: auction.articleDetails.startPrice,
        currentHighestBid: auction.currentHighestBid || 0,
        status: auction.status,
        reason: auction.cancellationReason || 'N/A',
        bids: auction.bids.map((bid) => ({
          id: bid.id,
          amount: bid.amount,
          refunded: bid.refunded,
          date: bid.createdAt,
        })),
        transactions: relevantTransactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.createdAt,
        })),
      };
    });

    res.status(200).json({ success: true, data: transformedAuctions });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des enchères :", error);
    res.status(500).json({ message: "Erreur serveur.", errorDetails: error.message });
  }
};


















































