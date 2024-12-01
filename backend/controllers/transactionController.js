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
