const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User'); // Assurez-vous que le chemin est correct
// Fonction pour envoyer un message de contact
const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Récupérez l'utilisateur connecté depuis la requête
  const currentUser = req.user; // Assurez-vous que votre middleware d'authentification ajoute l'utilisateur
  console.log('Données du message:', { name, email, subject, message });
  console.log('Utilisateur connecté:', currentUser);
  try {
   

    // Enregistrer le message dans la base de données
    const newMessage = await ContactMessage.create({ name, email, subject, message });

    // Configuration de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // ou un autre service de votre choix
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: 'admin@votreplateforme.com', // Adresse de l'administrateur
      subject: subject,
      text: `Nom: ${name}\nE-mail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Votre message a été envoyé avec succès', messageId: newMessage.id });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du message ou de l\'envoi de l\'e-mail:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// Fonction pour récupérer tous les messages
const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

// Fonction pour supprimer un message
const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMessage = await ContactMessage.destroy({ where: { id } });

    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    res.status(200).json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du message' });
  }
};

module.exports = {
  sendContactEmail,
  getAllMessages,
  deleteMessage,
};