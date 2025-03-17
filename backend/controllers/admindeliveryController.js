const Delivery = require('../models/Delivery');
const User = require('../models/User');
const Auction = require('../models/Auction');
const Article = require('../models/Article');

/**
 * ✅ Récupérer toutes les livraisons avec filtres (Ex: ?status=shipped)
 */
exports.getAllDeliveries = async (req, res) => {
    try {
        const { status } = req.query; // Filtrer par statut si précisé

        let query = {};
        if (status) {
            query.status = status;
        }

        const deliveries = await Delivery.findAll({
            where: query,
            include: [
                { model: User, as: "buyer", attributes: ["id", "name", "email", "address"] },
                { model: User, as: "seller", attributes: ["id", "name", "email"] },
                {
                    model: Auction,
                    as: "auction",
                    include: [{ model: Article, as: "articleDetails", attributes: ["id", "name"] }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({ success: true, deliveries });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des livraisons :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

/**
 * ✅ Voir les détails d'une livraison
 */
exports.getDeliveryDetails = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        const delivery = await Delivery.findByPk(deliveryId, {
            include: [
                { model: User, as: "buyer", attributes: ["id", "name", "email", "address"] },
                { model: User, as: "seller", attributes: ["id", "name", "email"] },
                {
                    model: Auction,
                    as: "auction",
                    include: [{ model: Article, as: "articleDetails", attributes: ["id", "name"] }],
                },
            ],
        });

        if (!delivery) {
            return res.status(404).json({ message: "Livraison non trouvée." });
        }

        res.status(200).json({ success: true, delivery });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de la livraison :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
