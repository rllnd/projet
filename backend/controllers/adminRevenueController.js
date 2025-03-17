const GTCTransaction = require('../models/GTCTransaction');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

/**
 * 📊 Récupérer les revenus de la plateforme
 */
exports.getPlatformRevenue = async (req, res) => {
    try {
        const { period } = req.query;
        let whereClause = {
            type: ['fee', 'commission'], // Transactions pertinentes
            status: 'completed' // Uniquement les transactions réussies
        };

        if (period) {
            const now = new Date();
            if (period === 'daily') {
                whereClause.createdAt = { [Op.gte]: new Date(now.setHours(0, 0, 0, 0)) };
            } else if (period === 'monthly') {
                whereClause.createdAt = { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1) };
            } else if (period === 'yearly') {
                whereClause.createdAt = { [Op.gte]: new Date(now.getFullYear(), 0, 1) };
            }
        }

        // Récupérer toutes les transactions détaillées
        const transactions = await GTCTransaction.findAll({
            where: whereClause,
            attributes: ['id', 'type', 'amount', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, revenues: transactions });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des revenus :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
