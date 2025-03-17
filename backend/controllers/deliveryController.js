const User = require('../models/User');
const Notification = require('../models/Notifications');
const GTCTransaction = require('../models/GTCTransaction'); // Import du modèle GTCTransaction
const sequelize = require('../config/db'); // ✅ Import de Sequelize
const Delivery = require('../models/Delivery');
const Article = require('../models/Article');
const Auction = require('../models/Auction');
/**
 * 🛒 Le vendeur marque l'article comme expédié
 */
exports.shipOrder = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { trackingNumber } = req.body;
       
        const delivery = await Delivery.findByPk(deliveryId);

        if (!delivery || delivery.status !== "pending") {
            return res.status(400).json({ message: "Livraison invalide ou déjà expédiée." });
        }

        delivery.status = "shipped";
        delivery.trackingNumber = trackingNumber;
        await delivery.save();

        // 📌 Notification à l'acheteur
        await Notification.create({
            userId: delivery.buyerId,
            message: `Votre commande a été expédiée ! Numéro de suivi : ${trackingNumber}`,
        });

        console.log(`[INFO] 🚚 Article expédié (Tracking: ${trackingNumber})`);

        res.status(200).json({ message: "Article marqué comme expédié.", delivery });
    } catch (error) {
        console.error("Erreur lors de l'expédition :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

/**
 * 📦 Récupérer les informations d'une livraison
 */
exports.getDeliveryDetails = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        const delivery = await Delivery.findByPk(deliveryId, {
            include: [
                { model: User, as: "buyer", attributes: ["id", "name", "email"] },
                { model: User, as: "seller", attributes: ["id", "name", "email"] },
            ],
        });

        if (!delivery) {
            return res.status(404).json({ message: "Livraison non trouvée." });
        }

        res.status(200).json(delivery);
    } catch (error) {
        console.error("Erreur lors de la récupération de la livraison :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

//Livraison côté vendeur
exports.getSellerSales = async (req, res) => {
    try {
        const sellerId = req.user.id; // ✅ Récupérer l'ID du vendeur connecté
        console.log(`[DEBUG] 🛒 Requête API reçue pour le vendeur connecté ID: ${sellerId}`);

        const sales = await Delivery.findAll({
            where: { sellerId: sellerId },
            include: [
                {
                    model: User,
                    as: "buyer",
                    attributes: ["id", "name", "email","address"]
                },
                {
                    model: Auction,
                    as: "auction",
                    include: [{
                        model: Article,
                        as: "articleDetails",
                        attributes: ["id", "name"]
                    }],
                }
            ],
        });

        console.log(`[DEBUG] 📦 Résultat SQL Sequelize :`, JSON.stringify(sales, null, 2));
        res.status(200).json(sales);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des ventes :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

//Livraison en attente côté acheteur
exports.getBuyerPurchases = async (req, res) => {
    try {
        const buyerId = req.user.id; // Récupérer l'ID de l'acheteur connecté via JWT
        console.log(`[DEBUG] 🛒 Requête API reçue pour l'acheteur connecté ID: ${buyerId}`);

        const purchases = await Delivery.findAll({
            where: { buyerId: buyerId },
            attributes: ['id', 'auctionId', 'status', 'codeUnique', 'trackingNumber', 'createdAt', 'address'],
            include: [
                {
                    model: User,
                    as: "seller",
                    attributes: ["id", "name", "email"]
                },
                {
                    model: Auction,
                    as: "auction",
                    include: [{
                        model: Article,
                        as: "articleDetails",
                        attributes: ["id", "name"]
                    }],
                }
            ],
        });

        res.status(200).json(purchases);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des achats :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// Confirmation de réception par l'acheteur
exports.confirmDelivery = async (req, res) => {
    let transaction;

    try {
        transaction = await sequelize.transaction(); // ✅ Démarrer la transaction

        const { deliveryId } = req.params;
        const { codeUnique } = req.body;

        // ✅ Charger la livraison avec l'enchère et le vendeur
        const delivery = await Delivery.findByPk(deliveryId, {
            include: [
                { model: User, as: "seller" },
                { model: Auction, as: "auction" },
                { model: User, as: "buyer" }
            ],
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!delivery || delivery.status !== "shipped") {
            throw new Error("Impossible de confirmer la réception.");
        }

        if (delivery.codeUnique !== codeUnique) {
            throw new Error("Code de confirmation incorrect.");
        }

        if (!delivery.seller || !delivery.auction) {
            throw new Error("Le vendeur ou l'enchère associée est introuvable.");
        }

        // ✅ Vérifier si la transaction escrow existe pour le vendeur
        const escrowTransaction = await GTCTransaction.findOne({
            where: { auctionId: delivery.auction.id, userId: delivery.seller.id, type: "escrow", status: "pending" },
            transaction
        });

        if (!escrowTransaction) {
            throw new Error("Aucune transaction escrow en attente trouvée pour cette vente.");
        }

        const seller = await User.findByPk(delivery.seller.id, { transaction });

        const totalReward = escrowTransaction.amount;

        // ✅ Mettre à jour la livraison en "delivered"
        delivery.status = "delivered";
        delivery.deliveryDate = new Date();
        await delivery.save({ transaction });

        console.log(`[INFO] ✅ Livraison mise à jour en "delivered" pour l'enchère ${delivery.auction.id}`);

        // ✅ Libérer les fonds du vendeur
        seller.tokenBalance += totalReward;
        seller.escrowBalance -= totalReward;
        await seller.save({ transaction });

        console.log(`[INFO] 💰 Fonds libérés au vendeur ${seller.name} (${totalReward} GTC)`);

        // ✅ Marquer la transaction `escrow` comme terminée
        escrowTransaction.status = "completed";
        escrowTransaction.success = true;
        await escrowTransaction.save({ transaction });

       

        // Vérifier que l'acheteur est bien défini
        if (!delivery.buyer || !delivery.buyer.id) {
            throw new Error("Impossible de traiter la transaction : acheteur introuvable.");
        }

        // Vérifier si la transaction escrow existe pour l'acheteur
        const buyerEscrowTransaction = await GTCTransaction.findOne({
            where: { auctionId: delivery.auction.id, userId: delivery.buyer.id, type: "escrow", status: "pending" },
            transaction
        });

        if (!buyerEscrowTransaction) {
            throw new Error("Aucune transaction escrow en attente trouvée pour cet acheteur.");
        }

          // ✅ Marquer la transaction `escrow` comme terminée pour l'acheteur
          buyerEscrowTransaction.status = "completed";
          buyerEscrowTransaction.success = true;
          await buyerEscrowTransaction.save({ transaction });

         // ✅ Vérifier si la transaction "commission" existe et la marquer comme complétée
         await GTCTransaction.update(
            { success: true },
            { 
                where: { 
                    auctionId: delivery.auction.id, 
                    type: "commission",
                    userId: null
                },
                transaction,
                validate: false, // ✅ Désactive la validation automatique de Sequelize
                individualHooks: false // ✅ Empêche Sequelize d'exécuter ses propres validations
            }
        );
        
        // ✅ Transformer la transaction escrow en "reward" après la confirmation de livraison
        await escrowTransaction.update(
            {
                type: "reward",
                status: "completed",
                success: true,
                description: `Paiement libéré pour la vente de "${delivery.auction.articleDetails?.name || 'Article inconnu'}".`
            },
            { transaction }
        );

        console.log(`[INFO] ✅ Transaction mise à jour : escrow → reward pour le vendeur ${seller.name}.`);

        // ✅ Mettre à jour la transaction escrow de l'acheteur pour indiquer qu'elle est terminée
        await buyerEscrowTransaction.update(
            {
                type: "spend",
                status: "completed",
                success: true,
                description: `Transaction terminée pour l'achat de "${delivery.auction.articleDetails?.name || 'Article inconnu'}".`
            },
            { transaction }
        );
  
          
        // ✅ Valider toutes les mises à jour
        await transaction.commit();
        
        res.status(200).json({ message: "Réception confirmée, paiement libéré.", delivery });

    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        console.error("❌ Erreur lors de la confirmation de réception :", error);
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};

//confirmer l'adresse de l'acheteur
exports.confirmAddress = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const sellerId = req.user.id; // ID du vendeur connecté

        // 🔍 Vérifier si la livraison existe et appartient bien au vendeur
        const delivery = await Delivery.findByPk(deliveryId);
        if (!delivery) {
            return res.status(404).json({ message: "Livraison non trouvée." });
        }

        if (delivery.sellerId !== sellerId) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à confirmer cette adresse." });
        }

        if (delivery.addressConfirmed) {
            return res.status(400).json({ message: "L'adresse est déjà confirmée." });
        }

        // ✅ Confirmer l'adresse
        await delivery.update({ addressConfirmed: true });

        // ✅ Notifier l'acheteur
        await Notification.create({
            userId: delivery.buyerId,
            message: "Votre adresse a été confirmée par le vendeur. L'expédition est en cours de préparation.",
        });

        console.log(`[INFO] 📍 Adresse confirmée pour la livraison ID=${deliveryId}`);
        res.status(200).json({ message: "Adresse confirmée avec succès.", delivery });

    } catch (error) {
        console.error("❌ Erreur lors de la confirmation de l'adresse :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

//consultation de l'adresse de l'acheteur
exports.getBuyerAddress = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const sellerId = req.user.id;

        const delivery = await Delivery.findByPk(deliveryId, {
            attributes: ["address", "addressConfirmed", "buyerId", "sellerId"]
        });

        if (!delivery) {
            return res.status(404).json({ message: "Livraison non trouvée." });
        }

        if (delivery.sellerId !== sellerId) {
            return res.status(403).json({ message: "Accès interdit." });
        }

        res.status(200).json({
            address: delivery.address,
            addressConfirmed: delivery.addressConfirmed,
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'adresse :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};













