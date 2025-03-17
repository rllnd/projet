const { getIO } = require("../config/socket");
const { Op } = require("sequelize");
const sequelize = require('../config/db'); 
const Bid = require("../models/Bid");
const Auction = require("../models/Auction");
const User = require("../models/User");
const Article = require("../models/Article");
const Notification = require("../models/Notifications");
const { bidQueue } = require("../config/queue");
const { closeExpiredAuctions } = require('./auctionController');
const AutoBid = require('../models/autobid'); // Import du modèle AutoBid

// ✅ Valider l'état d'une enchère
const validateAuctionState = (auction) => {
  if (!auction || auction.status !== "open") {
    throw new Error("L'enchère est fermée ou non disponible.");
  }
  if (new Date(auction.endDate) < new Date()) {
    throw new Error("L'enchère est déjà terminée.");
  }
};

const getHighestBidderName = async (highestBidderId) => {
  const user = await User.findByPk(highestBidderId);
  return user ? user.name : 'Utilisateur inconnu';
};

//remboursement
const refundPreviousBid = async (auction, article, currentHighestBid) => {
  if (!auction || !auction.highestBidUserId) return;

  const previousBid = await Bid.findOne({
    where: { auctionId: auction.id, userId: auction.highestBidUserId, refunded: false },
  });

  if (!previousBid) {
    console.log(`[INFO] Aucune enchère précédente à rembourser pour l'enchère ID: ${auction.id}.`);
    return; // Aucune enchère précédente à rembourser
  }

  const previousBidder = await User.findByPk(previousBid.userId);
  if (!previousBidder) {
    console.log(`[INFO] Utilisateur non trouvé pour l'enchère ID: ${previousBid.id}.`);
    return; // Utilisateur non trouvé
  }

  // Vérifier si l'AutoBid peut encore surenchérir
  if (previousBid.isAutoBid && previousBid.amount > currentHighestBid + 1) {
    console.log(
      `[INFO] L'enchère automatique de ${previousBid.amount} GTC peut encore réagir. Aucun remboursement.`
    );
    return;
  }

  // ✅ Rembourser **toute** la réserve initiale
  const totalRefund = previousBid.amount;

  previousBidder.tokenBalance += totalRefund;
  await previousBidder.save();

  previousBid.refunded = true;
  await previousBid.save();

  console.log(`[INFO] 🔥 Remboursement total de ${totalRefund} GTC à User ID: ${previousBidder.id}.`);

  await Notification.create({
    userId: previousBidder.id,
    message: `Votre réserve totale de ${totalRefund} GTC pour "${article.name}" a été remboursée.`,
    isRead: false,
  });
};

exports.placeManualBid = async (req, res) => {
  try {
    await closeExpiredAuctions();

    const { articleId, bidAmount } = req.body;
    const userId = req.user.id;

    const article = await Article.findByPk(articleId, {
      include: [{ model: Auction, as: 'auctionDetails' }],
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    

    const auction = article.auctionDetails;

    try {
      validateAuctionState(auction);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    if (bidAmount <= auction.currentHighestBid) {
      return res.status(400).json({ message: "Le montant doit être supérieur à l'offre actuelle." });
    }

    const user = await User.findByPk(userId);
    if (!user || user.tokenBalance < bidAmount) {
      return res.status(400).json({ message: "Fonds insuffisants." });
    }

    if (auction.highestBidUserId === userId) {
      return res.status(400).json({ message: "Vous êtes déjà le plus offrant." });
    }

     // ✅ Bloquer les vendeurs
     if (user.role === "seller") {
      return res.status(403).json({ message: " Les vendeurs ne peuvent pas enchérir sur les articles !" });
    }

     // ✅ Désactiver temporairement les AutoBids
     auction.autoBidDisabled = true;
     await auction.save();
     
    await refundPreviousBid(auction, article, auction.currentHighestBid);

    user.tokenBalance -= bidAmount;
    await user.save();

    article.price = bidAmount;
    await article.save();

    const bid = await Bid.create({
      auctionId: auction.id,
      userId,
      amount: bidAmount,
      bidTime: new Date(),
      isAutoBid: false,
      reserved: false,
    });

    auction.currentHighestBid = bidAmount;
    auction.highestBidUserId = userId;
    auction.lastBidTime = new Date();
    await auction.save();
    
    // Vérifier et activer les AutoBids après la mise manuelle
    console.log("📌 Vérification des AutoBids après une enchère manuelle...");
    
     // Ajout du job à la queue pour la mise manuelle
     if (bidQueue && typeof bidQueue.getJobs === "function") {
      await bidQueue.add('manual-bid', {
        auctionId: auction.id,
        userId,
        bidAmount,
      });
    } else {
      console.error("❌ Erreur : bidQueue n'est pas initialisé correctement !");
    }
    
    


    await Notification.create({
      userId,
      message: `Votre enchère de ${bidAmount} GTC pour "${article.name}" a été placée avec succès.`,
      isRead: false,
    });

    // ✅ Réactiver les AutoBids après un léger délai
    setTimeout(async () => {
      auction.autoBidDisabled = false;
      await auction.save();
      await exports.checkAutoBids(auction.id, bidAmount);
    }, 1500); 

    // 🔥 WebSocket - Notifier en temps réel
    const io = getIO();
    io.emit("bid-updated", {
      auctionId: auction.id,
      currentHighestBid: auction.currentHighestBid,
      highestBidderId: userId,
      highestBidderName: user.name,
      highestBidAmount: bidAmount,
    });
    

    res.status(200).json({
      message: "Enchère placée avec succès.",
      auction: {
        id: auction.id,
        articleId: article.id,
        currentHighestBid: auction.currentHighestBid,
        highestBidUserId: auction.highestBidUserId,
        status: auction.status,
      },
      bid,
    });

    
    
  } catch (error) {
    console.error("Erreur lors de la soumission de l'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Traiter une enchère (manuelle ou automatique)
exports.processBid = async ({ auctionId, bidAmount, userId, isAutoBid, transaction = null }) => {
  const t = transaction || await sequelize.transaction(); // ✅ Démarrer une transaction si aucune n'existe

  try {
    console.log(`📌 [processBid] Traitement pour AuctionID=${auctionId}, UserID=${userId}, BidAmount=${bidAmount}`);

    // 🔍 Vérification et récupération de l'enchère avec l'article lié
    let auction = await Auction.findByPk(auctionId, {
      include: [{ model: Article, as: "articleDetails" }],
      transaction: t
    });

    if (!auction) throw new Error(`❌ [processBid] Enchère ID=${auctionId} non trouvée.`);
    console.log(`✅ [processBid] Enchère trouvée: AuctionID=${auction.id}, ArticleID=${auction.articleId}`);

    // 🔍 Vérification et récupération de l'article
    let article = auction.articleDetails;
    if (!article) throw new Error(`❌ [processBid] Impossible de récupérer l'Article ID=${auction.articleId}`);

    console.log(`✅ [processBid] Article trouvé: ID=${article.id}, Nom=${article.name}`);

    // ✅ Validation de l'état de l'enchère
    if (auction.status !== "open") throw new Error("L'enchère est fermée.");
    if (new Date(auction.endDate) < new Date()) throw new Error("L'enchère est déjà terminée.");
    if (bidAmount <= auction.currentHighestBid) throw new Error("Montant trop bas.");

    // 🔍 Vérification du solde de l'utilisateur
    let user = await User.findByPk(userId, { transaction: t });
    if (!user || user.tokenBalance < bidAmount) throw new Error("Fonds insuffisants.");
    if (auction.highestBidUserId === userId) throw new Error("Déjà le plus offrant.");

    // ✅ Remboursement du précédent enchérisseur
    if (auction.highestBidUserId) {
      let previousBidder = await User.findByPk(auction.highestBidUserId, { transaction: t });
      if (previousBidder) {
        previousBidder.tokenBalance += auction.currentHighestBid;
        await previousBidder.save({ transaction: t });
      }
    }

    // ✅ Déduction du solde de l'utilisateur actuel
    user.tokenBalance -= bidAmount;
    await user.save({ transaction: t });

    // ✅ Enregistrement de l'enchère
    await Bid.create(
      { auctionId: auction.id, userId, amount: bidAmount, isAutoBid },
      { transaction: t }
    );

    // ✅ Mise à jour de l'enchère avec `highestBidUserId`
    auction.currentHighestBid = bidAmount;
    auction.highestBidUserId = userId;

    // ✅ Mise à jour de `lastAutoBidTime` si c'est un AutoBid
    if (isAutoBid) {
      auction.lastAutoBidTime = new Date();
      console.log(`✅ lastAutoBidTime mis à jour pour l'AutoBid sur AuctionID=${auction.id}: ${auction.lastAutoBidTime}`);
    }
    await auction.save({ transaction: t });

    console.log(`✅ Mise à jour effectuée : AuctionID=${auction.id}, highestBidUserId=${auction.highestBidUserId}`);

    // 🔥 **Récupérer les dernières données après mise à jour**
    auction = await Auction.findByPk(auctionId, {
      include: [{ model: User, as: "highestBidder", attributes: ["id", "name"] }],
      transaction: t
    });

    // ✅ Mise à jour de l'article (prix actuel)
    article.price = bidAmount;
    await article.save({ transaction: t });

    // ✅ Envoi de l'événement WebSocket après une mise réussie
    console.log(`🎯 Nouvelle enchère enregistrée: AuctionID=${auction.id}, HighestBidder=${userId}, Nom=${user.name}`);
    
    const io = getIO();
    io.emit("bid-updated", {
      auctionId: auction.id,
      currentHighestBid: auction.currentHighestBid,
      highestBidderId: userId,
      highestBidderName: user.name
    });

    // ✅ Commit de la transaction si elle a été créée ici
    if (!transaction) await t.commit();

    console.log(`✅ [processBid] Enchère validée: ${bidAmount} GTC par UserID=${userId}`);
    
     // ✅ Activer l'AutoBid pour les autres utilisateurs après une enchère manuelle
     if (!isAutoBid) {
      console.log("📌 Vérification des AutoBids après une enchère manuelle...");
      await exports.checkAutoBids(auctionId, bidAmount);
    }
    
    return { auction };

  } catch (error) {
    if (!transaction) await t.rollback();
    console.error(`❌ [processBid] Erreur:`, error);
    throw error;
  }
};



// ✅ Placer un AutoBid
exports.placeAutoBid = async (req, res) => {
  try {

    await closeExpiredAuctions();
    const { articleId, maxBidAmount } = req.body;
    const userId = req.user.id;

    if (!articleId || !maxBidAmount || maxBidAmount <= 0) {
      return res.status(400).json({ message: "Paramètres invalides." });
    }

    const article = await Article.findByPk(articleId, {
      include: [{ model: Auction, as: "auctionDetails", where: { status: "open" } }]
    });

    if (!article || !article.auctionDetails) {
      return res.status(404).json({ message: "Aucune enchère trouvée." });
    }

    const auction = article.auctionDetails; // ✅ Définir `auction`

     // ✅ Récupérer l'utilisateur depuis la base de données
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // ✅ Bloquer les vendeurs
    if (user.role === "seller") {
      return res.status(403).json({ message: " Les vendeurs ne peuvent pas enchérir sur les articles !" });
    }

    const auctionId = article.auctionDetails.id;

    // 🔍 Vérifier si l'utilisateur est déjà le plus offrant
if (article.auctionDetails.highestBidUserId === userId) {
  return res.status(400).json({ message: "Vous êtes déjà le plus offrant." });
}

    // Vérifier si un AutoBid existe déjà
    let autoBid = await AutoBid.findOne({ where: { auctionId, userId } });

    if (autoBid) {
      autoBid.maxBidAmount = maxBidAmount;
      await autoBid.save();
    } else {
      await AutoBid.create({ auctionId, userId, maxBidAmount });
    }

    auction.autoBidActive = true;
    await auction.save({ fields: ["autoBidActive"] }); // 🔥 Forcer la mise à jour uniquement de `autoBidActive`


    res.status(201).json({ message: "AutoBid enregistré avec succès." });

     // 🔥 Vérifier si l'AutoBid peut se déclencher immédiatement
     await exports.checkAutoBids(auctionId, article.auctionDetails.currentHighestBid);

  } catch (error) {
    console.error("❌ Erreur AutoBid :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Vérifier et activer les AutoBids après chaque mise
exports.checkAutoBids = async (auctionId, lastBidAmount) => {
  try {

    console.log(`🔍 [checkAutoBids] Vérification des AutoBids après un bid à ${lastBidAmount} GTC`);

    const auction = await Auction.findByPk(auctionId);
    if (!auction || auction.status !== "open") return;

    // ✅ Vérifier si les AutoBids sont temporairement désactivés
    if (auction.autoBidDisabled) {
      console.log(`❌ AutoBids désactivés temporairement pour l'enchère ID=${auction.id}`);
      return;
    }

    const autoBids = await AutoBid.findAll({ 
      where: { auctionId },
       order: [["maxBidAmount", "DESC"]] 
      });

    for (const autoBid of autoBids) {

      const nextBid = lastBidAmount + 1;

       // 🔥 🔍 Ne pas arrêter un AutoBid tant que son maxBidAmount n'est pas atteint !
       if (nextBid > autoBid.maxBidAmount) {
        console.log(`❌ AutoBid stoppé: NextBid=${nextBid} dépasse maxBid=${autoBid.maxBidAmount}`);
        continue;
      }
      

      if (autoBid.userId === auction.highestBidUserId) {
        console.log(`❌ AutoBid ignoré: L'utilisateur ID=${autoBid.userId} est déjà le plus offrant.`);
        continue;
      }
      
     
      console.log(`📌 AutoBid déclenché pour UserID=${autoBid.userId}, NextBid=${nextBid}`);

      await new Promise(resolve => setTimeout(resolve, 1000));

       // ✅ Exécution immédiate du AutoBid
       await exports.processAutoBid({
        auctionId,
        maxBidAmount: autoBid.maxBidAmount,
        userId: autoBid.userId
      });

      if (!bidQueue || typeof bidQueue.getJobs !== "function") {
        console.error("❌ Erreur : bidQueue n'est pas initialisé correctement !");
        return;
      }
       // ✅ Vérification avant d'ajouter un AutoBid en file d'attente
       const existingJobs = await bidQueue.getJobs(["waiting", "active"]);
       const userJobExists = existingJobs.some(job => job.data.userId === autoBid.userId && job.data.auctionId === auctionId);
 
       if (!userJobExists) {
         await bidQueue.add("auto-bid", {
           auctionId,
           maxBidAmount: autoBid.maxBidAmount,
           userId: autoBid.userId
         }, { priority: -autoBid.maxBidAmount });
       } else {
         console.log(`❌ AutoBid pour UserID=${autoBid.userId} déjà en attente. Pas de duplication.`);
       }

      break;
    }

  } catch (error) {
    console.error("❌ Erreur checkAutoBids :", error);
  }
};

// ✅ Traiter un AutoBid
exports.processAutoBid = async ({ auctionId, maxBidAmount, userId }) => {
  try {
    let auction = await Auction.findByPk(auctionId, { include: [{ model: Article, as: "articleDetails" }] });

    if (!auction || auction.status !== "open") return;

    // ❌ Vérification : Si l'utilisateur est déjà le plus offrant, on arrête ici
    if (auction.highestBidUserId === userId) {
      console.log(`❌ AutoBid annulé: L'utilisateur ID=${userId} est déjà le plus offrant.`);
      return;
    }
    let nextBid = auction.currentHighestBid + 1;
    
    if (nextBid > maxBidAmount) 
    {console.log(`❌ AutoBid terminé pour UserID=${userId}, car NextBid=${nextBid} dépasse MaxBid=${maxBidAmount}`)
      
      // ✅ Désactiver autoBidActive si l'utilisateur n'a plus de marge
      auction.autoBidActive = false;
      auction.lastAutoBidTime = null; 
      await auction.save({ fields: ["autoBidActive"] });
    
    return;
     }

     console.log(`⚡ Exécution AutoBid: UserID=${userId}, NextBid=${nextBid}`);

    const bidResult = await exports.processBid({
      auctionId,
      bidAmount: nextBid,

      userId,
      isAutoBid: true
    });

    if (bidResult) {
      // ✅ Mettre à jour immédiatement `lastAutoBidTime`

      const updatedAuction = await Auction.findByPk(auctionId);
      if (updatedAuction) {
        updatedAuction.lastAutoBidTime = new Date();
        await updatedAuction.save();
        console.log(`✅ [DEBUG] lastAutoBidTime mis à jour dans la transaction pour AuctionID=${auctionId}`);
      }

      
      
      setTimeout(async () => {
        let latestAuction = await Auction.findByPk(auctionId);

        // Vérifier si l'utilisateur est toujours le plus offrant avant d'envoyer la notification
        if (latestAuction.highestBidUserId === userId) {
          const io = getIO();
          io.emit("auto-bid-placed", {
            auctionId: bidResult.auction.id,
            currentHighestBid: bidResult.auction.currentHighestBid,
            highestBidderId: bidResult.auction.highestBidUserId,
            highestBidderName: await getHighestBidderName(bidResult.auction.highestBidUserId)
          });

          console.log(`📢 Notification envoyée après temporisation pour UserID=${userId}`);
        } else {
          console.log(`❌ Notification annulée, un nouvel enchérisseur a surpassé UserID=${userId}`);
        }
      }, 800);

      console.log(`🎯 AutoBid exécuté avec succès: ${nextBid} GTC`);
    }

    // 🔥 Vérifier immédiatement s'il faut relancer un autre AutoBid après cette mise
    await exports.checkAutoBids(auctionId, nextBid);

  } catch (error) {
    console.error("❌ Erreur processAutoBid :", error);
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
              attributes: ['id', 'name', 'endDate'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const result = participatingBids.map((bid) => ({
      auctionId: bid.auction.id,
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