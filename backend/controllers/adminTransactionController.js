const { Op } = require('sequelize');
const GTCTransaction = require('../models/GTCTransaction');
const User = require('../models/User');
const ConversionRate = require('../models/ConversionRate');

// Récupérer les transactions journalières, mensuelles ou annuelles
exports.getAdminTransactionHistory = async (req, res) => {
  const { filterType } = req.query; // 'daily', 'monthly', 'annual'
  let dateCondition;

  try {
    const currentDate = new Date();

    if (filterType === 'daily') {
      dateCondition = {
        createdAt: {
          [Op.gte]: new Date(currentDate.setHours(0, 0, 0, 0)),
          [Op.lt]: new Date(currentDate.setHours(23, 59, 59, 999)),
        },
      };
    } else if (filterType === 'monthly') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      dateCondition = {
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lt]: new Date(endOfMonth.setHours(23, 59, 59, 999)),
        },
      };
    } else if (filterType === 'annual') {
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
      dateCondition = {
        createdAt: {
          [Op.gte]: startOfYear,
          [Op.lt]: new Date(endOfYear.setHours(23, 59, 59, 999)),
        },
      };
    } else {
      dateCondition = {}; // Aucun filtre, toutes les transactions
    }

    const transactions = await GTCTransaction.findAll({
      where: dateCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: ConversionRate,
          as: 'rateDetails',
          attributes: ['id', 'rate'],
        },
      ],
      attributes: [
        'id',
        'type',
        'amount',
        'saleAmount',
        'operator',
        'phoneNumber',
        'success',
        'transactionId',
        'createdAt',
      ],
      order: [['createdAt', 'DESC']],
    });

    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction.toJSON(),
      createdAt: transaction.createdAt ? transaction.createdAt.toISOString() : null,
    }));

    return res.status(200).json({
      success: true,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des transactions.',
    });
  }
};

// Récupérer tous les détails des transactions avec plage de dates
exports.getAllTransactionDetails = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const whereClause = startDate && endDate ? {
      createdAt: {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate),
      },
    } : {};

    const transactions = await GTCTransaction.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: ConversionRate,
          as: 'rateDetails',
          attributes: ['id', 'rate'],
        },
      ],
      attributes: [
        'id',
        'type',
        'amount',
        'saleAmount',
        'operator',
        'phoneNumber',
        'success',
        'transactionId',
        'createdAt',
      ],
      order: [['createdAt', 'DESC']],
    });

    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction.toJSON(),
      createdAt: transaction.createdAt ? transaction.createdAt.toISOString() : null,
    }));

    return res.status(200).json({
      success: true,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions détaillées :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des transactions.',
    });
  }
};
