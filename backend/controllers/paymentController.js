const GTCTransaction = require('../models/GTCTransaction');
const { Sequelize } = require('sequelize');
const User = require('../models/User');
const axios = require('axios');
const ConversionRate = require('../models/ConversionRate')
const Platform = require('../models/Platform'); // Import du modèle Platform

const sequelize = require('../config/db'); // Assurez-vous d'importer Sequelize correctement

// Fonction simulée pour traiter un paiement
// Fonction simulée ou réelle pour traiter un paiement
const simulateMobileMoneyPayment = async (operator, phoneNumber, amount) => {
  // Latence simulée
  await new Promise((resolve) => setTimeout(resolve, 200)); // Réduction à 200 ms

  // Simulation avec une probabilité de succès de 90 %
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `SIM-${operator}-${Date.now()}`,
    };
  } else {
    return {
      success: false,
      error: 'Simulation: Échec du paiement, veuillez réessayer.',
    };
  }
};

// Fonction pour traiter un paiement réel
const processRealMobileMoneyPayment = async (operator, phoneNumber, amount, receiverPhoneNumber) => {
  try {
    // Préparer les informations pour les appels API
    let apiUrl, headers, body;

    switch (operator) {
      case 'MVOLA':
        apiUrl = process.env.MVOLA_API_URL;
        headers = {
          Authorization: `Bearer ${process.env.MVOLA_API_TOKEN}`,
          'Content-Type': 'application/json',
        };
        body = {
          sender: phoneNumber,
          receiver: receiverPhoneNumber,
          amount,
          description: `Achat de ${amount} GTC`,
        };
        break;

      case 'Orange Money':
        apiUrl = process.env.ORANGE_MONEY_API_URL;
        headers = {
          Authorization: `Bearer ${process.env.ORANGE_API_TOKEN}`,
          'Content-Type': 'application/json',
        };
        body = {
          sender: phoneNumber,
          receiver: receiverPhoneNumber,
          amount,
          description: `Achat de ${amount} GTC`,
        };
        break;

      case 'Airtel Money':
        apiUrl = process.env.AIRTEL_MONEY_API_URL;
        headers = {
          Authorization: `Bearer ${process.env.AIRTEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        };
        body = {
          sender: phoneNumber,
          receiver: receiverPhoneNumber,
          amount,
          description: `Achat de ${amount} GTC`,
        };
        break;

      default:
        throw new Error('Opérateur invalide');
    }

    // Appel à l'API réelle
    const response = await axios.post(apiUrl, body, { headers });

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        transactionId: response.data.transactionId,
      };
    }

    return {
      success: false,
      error: response.data.message || 'Échec de la transaction.',
    };
  } catch (error) {
    console.error('Erreur lors de la communication avec l\'API :', error.response?.data || error.message);
    return {
      success: false,
      error: 'Erreur lors de la transaction avec l\'API mobile money.',
    };
  }
};

// Basculer entre simulation et mode réel
const processPayment = async (operator, phoneNumber, amount, receiverPhoneNumber) => {
  if (process.env.USE_SIMULATION === 'true') {
    return simulateMobileMoneyPayment(operator, phoneNumber, amount);
  } else {
    return processRealMobileMoneyPayment(operator, phoneNumber, amount, receiverPhoneNumber);
  }
};



// Contrôleur pour l'achat de GTC avec validations
exports.purchaseGTC = async (req, res) => {
  const { operator, phoneNumber, amount, receiverPhoneNumber } = req.body;

  // Initialisation de la transaction Sequelize
  const transaction = await sequelize.transaction();
  try {
    // Validation de l'opérateur
    if (!['MVOLA', 'Orange Money', 'Airtel Money'].includes(operator)) {
      return res.status(400).json({ success: false, message: 'Opérateur invalide.' });
    }

    // Validation des champs obligatoires
    if (!phoneNumber || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone ou montant invalide.',
      });
    }

    // Récupérer l'utilisateur connecté avec verrouillage
    const user = await User.findByPk(req.user.id, { transaction, lock: true });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    // Validation du numéro de téléphone de l'utilisateur
    if (phoneNumber !== user.phone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le numéro de téléphone ne correspond pas à celui enregistré pour cet utilisateur.',
      });
    }

    // Validation du format du numéro de téléphone pour l'opérateur
    const phonePatterns = {
      MVOLA: /^034\d{7}$/,
      'Orange Money': /^032\d{7}$/,
      'Airtel Money': /^033\d{7}$/,
    };

    if (!phonePatterns[operator]?.test(phoneNumber)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Le numéro de téléphone ne respecte pas le format de ${operator}.`,
      });
    }

    // Validation du numéro récepteur
    const validReceiverNumbers = [
      process.env.MVOLA_RECEIVER_PHONE,
      process.env.ORANGE_RECEIVER_PHONE,
      process.env.AIRTEL_RECEIVER_PHONE,
    ];
    if (!validReceiverNumbers.includes(receiverPhoneNumber)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le numéro du récepteur est invalide.',
      });
    }

    // Traitement du paiement (simulation ou réel)
    const paymentResponse = await processPayment(operator, phoneNumber, amount);

    if (!paymentResponse.success) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: `Échec du paiement via ${operator}: ${paymentResponse.error}`,
      });
    }

    // Mise à jour du solde utilisateur
    user.tokenBalance += amount;
    await user.save({ transaction });

    // Récupérer et valider la plateforme
    const platform = await Platform.findOne({ transaction });
    if (!platform) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Plateforme introuvable.' });
    }

    // Vérification des limites d'achat
    if (platform.minPurchaseLimit !== null && amount < platform.minPurchaseLimit) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Le montant minimum est ${platform.minPurchaseLimit}.`,
      });
    }
    if (platform.maxPurchaseLimit !== null && amount > platform.maxPurchaseLimit) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Le montant maximum est ${platform.maxPurchaseLimit}.`,
      });
    }

    // Mise à jour du solde de la plateforme
    platform.balance -= amount;
    await platform.save({ transaction });

    const conversionRate = await ConversionRate.findOne({ where: { fromCurrency: 'GTC', toCurrency: 'MGA' } });

    if (!conversionRate) {
      return res.status(500).json({ success: false, message: 'Taux de conversion introuvable.' });
    }

    const totalInMGA = amount * conversionRate.rate; // Calcul du montant réel


    // Enregistrement de la transaction
    const gtcTransaction = await GTCTransaction.create(
      {
        type: 'purchase',
        amount,
        operator,
        phoneNumber,
        saleAmount: totalInMGA,
        conversionRateId: conversionRate.id, 
        appliedConversionRate: conversionRate.rate,
        receiverPhoneNumber,
        description: `Achat de ${amount} GTC via ${operator}`,
        transactionId: paymentResponse.transactionId,
        success: true,
        userId: req.user.id,
        status:'completed'
      },
      { transaction }
    );

    // Commit de la transaction
    await transaction.commit();

    // Réponse avec succès
    return res.status(200).json({
      success: true,
      message: `Achat de ${amount} GTC réussi via ${operator}.`,
      transaction: gtcTransaction,
      newBalance: user.tokenBalance,
      platformBalance: platform.balance,
    });
  } catch (error) {
    // Rollback en cas d'erreur
    if (transaction) await transaction.rollback();
    console.error('Erreur lors de l\'achat de GTC :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'achat de GTC.',
    });
  }
};

// Récupérer l'historique des transactions
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await GTCTransaction.findAll({
      where: { userId },
      include: [
        {
          model: ConversionRate,
          as: 'rateDetails', // Utilise l'alias défini dans les associations
          required: false, // Permet d'inclure même si rateDetails est NULL
          attributes: ['id','fromCurrency', 'toCurrency', 'rate', 'createdAt'],
        },
      ],
      attributes: [
        'id',
        'type',
        'amount',
        'saleAmount',
        'appliedConversionRate', // Champ contenant le taux utilisé
        'description',
        'transactionId',
        'operator', 
        'phoneNumber',
        'receiverPhoneNumber',
        'success',
        'status',
        'createdAt',
      ],
      order: [['createdAt', 'DESC']], // Tri des transactions par date
    });

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.',
    });
  }
};

// Traiter un paiement réel (ou simuler en mode développement)
const processRealPayment = async (operator, phoneNumber, amount) => {
  if (process.env.USE_SIMULATION === 'true') {
    return simulateMobileMoneyPayment(operator, phoneNumber, amount);
  }
  try {
    let apiUrl, headers, body;

    switch (operator) {
      case 'MVOLA':
        apiUrl = process.env.MVOLA_API_URL;
        headers = { Authorization: `Bearer ${process.env.MVOLA_API_TOKEN}` };
        body = { receiver: phoneNumber, amount, description: `Vente de GTC` };
        break;
      case 'Orange Money':
        apiUrl = process.env.ORANGE_MONEY_API_URL;
        headers = { Authorization: `Bearer ${process.env.ORANGE_API_TOKEN}` };
        body = { receiver: phoneNumber, amount, description: `Vente de GTC` };
        break;
      case 'Airtel Money':
        apiUrl = process.env.AIRTEL_MONEY_API_URL;
        headers = { Authorization: `Bearer ${process.env.AIRTEL_API_TOKEN}` };
        body = { receiver: phoneNumber, amount, description: `Vente de GTC` };
        break;
      default:
        throw new Error('Opérateur invalide');
    }

    const response = await axios.post(apiUrl, body, { headers });
    if (response.data.success) {
      return { success: true, transactionId: response.data.transactionId };
    }
    return { success: false, error: response.data.message || 'Échec de la transaction.' };
  } catch (error) {
    console.error('Erreur de communication avec l\'API :', error);
    return { success: false, error: 'Erreur de communication avec l\'API.' };
  }
};

exports.sellGTC = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amount, phoneNumber, operator } = req.body;

    // Validation des données
    if (!amount || amount <= 0 || !phoneNumber || !['MVOLA', 'Orange Money', 'Airtel Money'].includes(operator)) {
      return res.status(400).json({ success: false, message: "Données invalides." });
    }

    // Récupération de l'utilisateur
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Vérification du solde
    if (user.tokenBalance < amount) {
      return res.status(400).json({ success: false, message: "Solde insuffisant." });
    }

    const platform = await Platform.findOne();
if (!platform) {
  return res.status(404).json({ success: false, message: "Plateforme introuvable." });
}

// Vérification des limites de vente
if (platform.minSaleLimit && amount < platform.minSaleLimit) {
  return res.status(400).json({
    success: false,
    message: `La vente doit être au moins de ${platform.minSaleLimit} GTC.`,
  });
}

if (platform.maxSaleLimit && amount > platform.maxSaleLimit) {
  return res.status(400).json({
    success: false,
    message: `La vente ne peut pas dépasser ${platform.maxSaleLimit} GTC.`,
  });
}

    const conversionRate = await ConversionRate.findOne({ where: { fromCurrency: 'GTC', toCurrency: 'MGA' } });

    if (!conversionRate || !conversionRate.rate) {
      return res.status(500).json({ success: false, message: "Taux de conversion introuvable ou non défini." });
    }

    const totalInMGA = amount * conversionRate.rate; // Calcul sécurisé


    // Étape 1 : Traiter le paiement réel
    const paymentResponse = await processRealPayment(operator, phoneNumber, amount);
    if (!paymentResponse.success) {
      return res.status(500).json({
        success: false,
        message: `Échec du paiement via ${operator}: ${paymentResponse.error}`,
      });
    }

    // Mettre à jour le solde utilisateur
    user.tokenBalance -= amount;
    await user.save({ transaction });

    

    // Mise à jour du solde de la plateforme
    platform.balance += amount;  // Ajoute le montant à la balance
    await platform.save({ transaction });

    // Enregistrer la transaction de vente dans GTCTransaction
    const saleTransaction = await GTCTransaction.create({
      type: 'sale',
      amount,
      operator,
      phoneNumber,
      saleAmount: totalInMGA,
      conversionRateId: conversionRate.id, 
      appliedConversionRate: conversionRate.rate,
      description: `Vente de ${amount} GTC via ${operator}`,
      transactionId: paymentResponse.transactionId,  // ID de la transaction obtenue du paiement
      success: true,
      status:'completed',
      userId: req.user.id,
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Vente réussie.",
      platformBalance: platform.balance,
      saleTransaction,  // Inclure les détails de la transaction de vente
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Erreur lors de la vente :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};











/*kianchau.ns.cloudflare.com
kia.ns.cloudflare.com/*/



// Fonction réelle pour traiter un paiement (commentée pour activer plus tard)
/*
const processRealPayment = async (operator, phoneNumber, amount) => {
  try {
    const apiEndpoint = operator === 'MVOLA'
      ? process.env.MVOLA_API_URL
      : operator === 'Orange Money'
      ? process.env.ORANGE_MONEY_API_URL
      : process.env.AIRTEL_MONEY_API_URL;

    const response = await axios.post(apiEndpoint, {
      phoneNumber,
      amount,
      receiverPhoneNumber: process.env.RECEIVER_PHONE_NUMBER,
    }, {
      headers: {
        Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`,
      },
    });

    if (response.data.success) {
      return {
        success: true,
        transactionId: response.data.transactionId,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Échec du paiement.',
      };
    }
  } catch (error) {
    console.error('Erreur lors de la communication avec l\'API :', error);
    return { success: false, error: 'Erreur de communication avec l\'API.' };
  }
};
*/




//api réel 
{/*
// Fonction pour gérer les paiements réels
const processRealMobileMoneyPayment = async (operator, phoneNumber, amount, receiverPhoneNumber) => {
  try {
    let apiUrl, headers, body;

    switch (operator) {
      case 'MVOLA':
        apiUrl = 'https://api.mvola.mg/transactions';
        headers = {
          Authorization: `Bearer ${process.env.MVOLA_API_TOKEN}`,
          'Content-Type': 'application/json',
        };
        body = {
          sender: phoneNumber,
          receiver: receiverPhoneNumber,
          amount,
          description: `Achat de ${amount} GTC`,
        };
        break;
      case 'Orange Money':
        apiUrl = 'https://api.orange.mg/transactions';
        headers = {
          Authorization: `Bearer ${process.env.ORANGE_API_TOKEN}`,
          'Content-Type': 'application/json',
        };
        body = {
          sender: phoneNumber,
          receiver: receiverPhoneNumber,
          amount,
          description: `Achat de ${amount} GTC`,
        };
        break;
      case 'Airtel Money':
        apiUrl = 'https://api.airtel.africa/transactions';
        headers = {
          Authorization: `Bearer ${process.env.AIRTEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        };
        body = {
          sender: phoneNumber,
          receiver: receiverPhoneNumber,
          amount,
          description: `Achat de ${amount} GTC`,
        };
        break;
      default:
        throw new Error('Opérateur invalide');
    }

    const response = await axios.post(apiUrl, body, { headers });

    if (response.status === 200 && response.data.success) {
      return {
        success: true,
        transactionId: response.data.transactionId,
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Échec de la transaction',
      };
    }
  } catch (error) {
    console.error('Erreur API Mobile Money :', error.response?.data || error.message);
    return {
      success: false,
      error: 'Erreur lors de la transaction avec l\'API mobile money',
    };
  }
};

exports.purchaseGTC = async (req, res) => {
  const { operator, phoneNumber, amount } = req.body;

  try {
    if (!['MVOLA', 'Orange Money', 'Airtel Money'].includes(operator)) {
      return res.status(400).json({ success: false, message: 'Opérateur invalide' });
    }

    if (!phoneNumber || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Numéro de téléphone ou montant invalide.',
      });
    }

    let receiverPhoneNumber;
    switch (operator) {
      case 'MVOLA':
        receiverPhoneNumber = process.env.MVOLA_RECEIVER_PHONE;
        break;
      case 'Orange Money':
        receiverPhoneNumber = process.env.ORANGE_RECEIVER_PHONE;
        break;
      case 'Airtel Money':
        receiverPhoneNumber = process.env.AIRTEL_RECEIVER_PHONE;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Opérateur invalide' });
    }

    const paymentResponse = await processRealMobileMoneyPayment(operator, phoneNumber, amount, receiverPhoneNumber);

    if (!paymentResponse.success) {
      return res.status(500).json({
        success: false,
        message: `Échec du paiement via ${operator}: ${paymentResponse.error}`,
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    user.tokenBalance += amount;
    await user.save();

    const transaction = await GTCTransaction.create({
      type: 'purchase',
      amount,
      description: `Achat de ${amount} GTC via ${operator}`,
      userId: req.user.id,
      receiverPhoneNumber,
    });

    return res.status(200).json({
      success: true,
      message: `Achat de ${amount} GTC réussi via ${operator}`,
      transaction,
      newBalance: user.tokenBalance,
    });
  } catch (error) {
    console.error('Erreur lors de l\'achat de GTC:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'achat de GTC',
    });
  }
};

// Récupérer l'historique des transactions
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await GTCTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur.',
    });
  }
};*/}