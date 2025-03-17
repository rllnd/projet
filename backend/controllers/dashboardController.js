const User = require('../models/User');
const Auction = require('../models/Auction');
const Notification = require('../models/Notifications');
const ConversionRate = require('../models/ConversionRate'); // Assurez-vous que le modèle est importé
const Transaction = require('../models/GTCTransaction');

exports.getDashboardOverview = async (req, res) => {
  try {
    // Vérifiez si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const buyerId = req.user.id;

    // Récupérer le solde actuel
    const user = await User.findOne({ where: { id: buyerId } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const balance = user.tokenBalance;

    // Récupérer le taux de conversion
    const conversionRateEntry = await ConversionRate.findOne({
        where: {
          fromCurrency: 'GTC',
          toCurrency: 'MGA',
        },
         order: [['createdAt', 'DESC']], 
      });
      
      if (!conversionRateEntry) {
        console.error("Taux de conversion non trouvé");
        return res.status(404).json({ message: "Taux de conversion non trouvé." });
      }
      
      const conversionRate = conversionRateEntry.rate; // Récupérer le taux
      console.log('Taux de conversion:', conversionRate); // Log pour voir la valeur

    const balanceInAriary = (balance * conversionRate).toFixed(2); // Calculer le solde en Ariary

    // Récupérer les enchères en cours
    const activeBids = await Auction.count({
      where: {
        status: 'open',
      },
      include: [{
        model: User,
        as: 'highestBidder',
        where: { id: buyerId },
      }],
    });

    // Récupérer les enchères gagnées
    const wonBids = await Auction.count({
      where: {
        status: 'closed',
      },
      include: [{
        model: User,
        as: 'highestBidder',
        where: { id: buyerId },
      }],
    });

    // Récupérer l'historique des transactions
    const transactionCount = await Transaction.count({ where: { userId: buyerId } });

    // Récupérer les notifications non lues
    const notifications = await Notification.count({ where: { userId: buyerId, isRead: false } });

    // Envoyer les résultats
    res.status(200).json({
      success: true,
      data: {
        balance: `${balance} GTC`,
        balanceInAriary: `${balanceInAriary} Ariary`,
        activeBids,
        wonBids,
        transactionCount,
        notifications,
        conversionRate: conversionRate, // Inclure le taux de conversion
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la vue d\'ensemble de l\'acheteur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};