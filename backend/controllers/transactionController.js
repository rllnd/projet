// controllers/transactionController.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const getAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://openapiuat.airtel.africa/auth/oauth2/token', // URL pour l'environnement de test UAT
      new URLSearchParams({
        client_id: process.env.AIRTEL_CLIENT_ID,
        client_secret: process.env.AIRTEL_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log("Jeton d'accès obtenu :", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Erreur lors de l'obtention du jeton d'accès :", error.response?.data || error.message);
    console.error("Statut HTTP :", error.response?.status);
    console.error("En-têtes de réponse :", error.response?.headers);
    throw new Error("Impossible d'obtenir le jeton d'accès");
  }
};



const makePayment = async (mobileNumber, tokenAmount) => {
  const accessToken = await getAccessToken();  // Obtenez le jeton d'accès
  const amount = tokenAmount * 1.5;
  const reference = `trans_${Date.now()}`;

  try {
    const response = await axios.post(
      'https://openapiuat.airtel.africa/merchant/v1/payments/',
      {
        reference,
        subscriber: {
          country: 'MG',
          currency: 'MGA',
          msisdn: mobileNumber
        },
        transaction: {
          amount: amount.toFixed(2),
          currency: 'MGA'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,  // Ajoutez le jeton d'accès dans les en-têtes
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.status === 'SUCCESS';
  } catch (error) {
    console.error("Erreur lors du paiement :", error.response?.data || error.message);
    console.error("Statut HTTP :", error.response?.status);
    console.error("En-têtes de réponse :", error.response?.headers);
    throw new Error("Erreur lors du paiement");
  }
};



exports.purchaseTokens = async (req, res) => {
  const { mobileNumber, tokenAmount } = req.body;

  try {
    const paymentSuccess = await makePayment(mobileNumber, tokenAmount);
    if (paymentSuccess) {
      res.status(200).json({ message: 'Achat réussi' });
    } else {
      res.status(400).json({ message: "Le paiement a échoué" });
    }
  } catch (error) {
    console.error("Erreur lors de l'achat de tokens :", error.message);
    res.status(500).json({ message: error.message });
  }
};
{/*
const axios = require('axios');
const GTCTransaction = require('../models/GTCTransaction');
const User = require('../models/User');

const processMobileMoneyPayment = async (operator, phoneNumber, amount) => {
  try {
    const config = getOperatorConfig(operator);

    // Construire la requête de paiement
    const paymentRequest = {
      phoneNumber,
      amount,
      description: `Paiement GTC via ${operator}`,
    };

    // Effectuer la requête HTTP à l'API de l'opérateur
    const response = await axios.post(config.apiEndpoint, paymentRequest, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`, // Authentification via clé API
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      return { success: true, transactionId: response.data.transactionId };
    } else {
      return { success: false, error: response.data.message || 'Paiement échoué' };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

const getOperatorConfig = (operator) => {
  switch (operator) {
    case 'MVOLA':
      return {
        apiEndpoint: 'https://api.mvola.mg/payment',
        apiKey: process.env.MVOLA_API_KEY,
      };
    case 'Orange Money':
      return {
        apiEndpoint: 'https://api.orange-money.mg/payment',
        apiKey: process.env.ORANGE_MONEY_API_KEY,
      };
    case 'Airtel Money':
      return {
        apiEndpoint: 'https://api.airtel-money.mg/payment',
        apiKey: process.env.AIRTEL_MONEY_API_KEY,
      };
    default:
      throw new Error('Opérateur inconnu');
  }
};

exports.purchaseGTC = async (req, res) => {
  const { operator, phoneNumber, amount } = req.body;

  try {
    if (!['MVOLA', 'Orange Money', 'Airtel Money'].includes(operator)) {
      return res.status(400).json({ success: false, message: 'Opérateur invalide' });
    }

    // Étape 1 : Appeler l'API de l'opérateur
    const paymentResponse = await processMobileMoneyPayment(operator, phoneNumber, amount);

    if (!paymentResponse.success) {
      return res.status(500).json({
        success: false,
        message: `Échec du paiement via ${operator}: ${paymentResponse.error}`,
      });
    }

    // Étape 2 : Mise à jour de la base de données
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Ajouter des GTC au solde de l'utilisateur
    user.tokenBalance += amount;
    await user.save();

    // Enregistrer la transaction
    const transaction = await GTCTransaction.create({
      type: 'purchase',
      amount,
      description: `Achat de ${amount} GTC via ${operator}`,
      userId: req.user.id,
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
};*/}
