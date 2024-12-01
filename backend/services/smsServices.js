// backend/services/smsService.js
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendActivationCodeSMS = (phoneNumber, code) => {
    if (!phoneNumber.startsWith('+261')) {
      console.error("Le numéro doit inclure le code du pays pour Madagascar : '+261'.");
      return;
    }
  
    client.messages
      .create({
        body: `Votre code d'activation est : ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      })
      .then(message => console.log('SMS envoyé avec succès, ID:', message.sid))
      .catch(error => console.error('Erreur lors de l\'envoi du SMS:', error));
  };
  

module.exports = { sendActivationCodeSMS };
