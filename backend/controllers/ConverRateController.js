const ConversionRate = require('../models/ConversionRate');

// Récupérer le taux de conversion actuel
exports.getConversionRate = async (req, res) => {
  try {
    // Rechercher le dernier taux dans la base de données
    const rate = await ConversionRate.findOne({
      where: { fromCurrency: 'GTC', toCurrency: 'MGA' },
      order: [['createdAt', 'DESC']], // Dernier taux créé
    });

    // Si aucun taux n'est trouvé, retourner un taux par défaut
    if (!rate) {
      return res.status(200).json({ success: true, rate: 100 }); // Exemple : 1 GTC = 100 MGA
    }

    // Retourner le taux existant
    res.status(200).json({ success: true, rate: rate.rate });
  } catch (error) {
    console.error('Erreur lors de la récupération du taux de conversion :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
  
// Récupérer l'historique des taux de conversion
exports.getConversionRateHistory = async (req, res) => {
  try {
    const rates = await ConversionRate.findAll({
      where: { fromCurrency: 'GTC', toCurrency: 'MGA' },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, rates });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des taux de conversion :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Mettre à jour le taux de conversion
exports.updateConversionRate = async (req, res) => {
  const { rate } = req.body;

  // Validation du taux
  if (!rate || rate <= 0) {
    return res.status(400).json({ success: false, message: 'Taux de conversion invalide.' });
  }

  try {
    // Créer un nouvel enregistrement pour le taux (pour conserver l'historique)
    const newConversionRate = await ConversionRate.create({
      fromCurrency: 'GTC',
      toCurrency: 'MGA',
      rate,
    });

    res.status(200).json({
      success: true,
      message: 'Taux de conversion mis à jour avec succès.',
      rate: newConversionRate,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du taux de conversion :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};


exports.getRecentConversionRates = async (req, res) => {
  try {
    const rates = await ConversionRate.findAll({
      where: { fromCurrency: 'GTC', toCurrency: 'MGA' },
      order: [['createdAt', 'DESC']], 
      limit: 5, // 🔥 On récupère seulement les 5 derniers enregistrements
    });

    res.status(200).json({ success: true, rates });
  } catch (error) {
    console.error("Erreur lors de la récupération des taux récents :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};
