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

// Fonction pour envoyer un email de réinitialisation de mot de passe
const sendPasswordResetEmail = (email, resetLink) => {
  const mailOptions = {
    from: 'rllnddavid@gmail.com', // Remplacez par votre adresse Gmail
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
    <p>Bonjour,</p>
    <p>Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant :</p>
    <a href="${resetLink}" style="text-decoration: none; color: blue;">Réinitialiser votre mot de passe</a>
    <p>Merci de suivre les instructions.</p>
  `,};

  // Envoi de l'email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    } else {
      console.log('Email envoyé : ' + info.response);
    }
  });
};

// Nouvelle fonction pour envoyer le code de vérification 2FA
const sendTwoFactorAuthCode = (email, code) => {
  const mailOptions = {
      from: process.env.EMAIL_USER, // Utiliser l'adresse de l'utilisateur configuré dans .env
      to: email,
      subject: 'Code de Vérification 2FA',
      text: `Bonjour,\n\nVotre code de vérification pour la vérification en deux étapes est : ${code}\n\nMerci de l'utiliser pour vérifier votre identité.`,
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



module.exports = { sendActivationCodeEmail, sendPasswordResetEmail,sendTwoFactorAuthCode };

