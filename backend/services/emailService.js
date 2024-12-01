require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// Fonction pour envoyer un code d'activation
const sendActivationCodeEmail = (email, code) => {
  const mailOptions = {
    from: 'rllnddavid@gmail.com', // Remplacez par votre adresse Gmail
    to: email,
    subject: 'Votre code d\'activation',
    text: `Bonjour,\n\nVotre code d'activation est : ${code}\n\nMerci de l'utiliser pour activer votre compte.`
  };

  // Envoi de l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    } else {
      console.log('Email envoyé : ' + info.response);
    }
  });
};

module.exports = { sendActivationCodeEmail };
