const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory'); // Import du modèle LoginHistory
const speakeasy = require('speakeasy');

// Fonction pour générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '80d',
  });
};
console.log("Clé secrète JWT:", process.env.JWT_SECRET);
const { sendActivationCodeEmail } = require('../services/emailService'); // Mettez le bon chemin vers votre fichier
const sendPasswordResetEmail = require('../services/emailService').sendPasswordResetEmail;
const { sendTwoFactorAuthCode } = require('../services/emailService'); // Ajustez le chemin selon votre structure de projet

const generateActivationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// Inscription d'un utilisateur avec gestion du fichier de profil
const registerUser = async (req, res) => {
  const { lastName,firstName, name, email, password, phone, role } = req.body;

  // Validation du champ 'role'
  if (!['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ message: "Le rôle doit être 'buyer' ou 'seller'." });
  }

  // Validation du mot de passe
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Le mot de passe doit contenir au moins 8 caractères, incluant une lettre, un chiffre et un caractère spécial."
    });
  }


  try {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
    }

    // Générer le code d'activation
    const activationCode = generateActivationCode();

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur avec le code d'activation
    const user = await User.create({
      lastName,
      firstName,
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      isApproved: false, // Par défaut, non activé
      activationCode, // Stocker le code d'activation dans la base de données
    });

    // Envoyer l'email avec le code d'activation
    sendActivationCodeEmail(email, activationCode);

    res.status(201).json({
      message: 'Utilisateur créé avec succès. Un code d\'activation a été envoyé à votre email.',
      userId: user.id,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

const verifyActivationCode = async (req, res) => {
  const { userId, code } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user || user.activationCode !== code) {
      return res.status(400).json({ message: 'Code d\'activation invalide.' });
    }

    user.isApproved = true; // Activer le compte
    user.activationCode = null; // Supprimer le code d'activation après vérification
    await user.save();

    res.json({ message: 'Compte activé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification du code d\'activation' });
  }
};


// Fonction pour enregistrer l'historique de connexion
const recordLogin = async (userId, ipAddress) => {
    await LoginHistory.create({
        userId,
        loginTime: new Date(),
        ipAddress,
    });
};

// Connexion d'un utilisateur avec vérification de l'approbation
const loginUser = async (req, res) => {
  const { email, password } = req.body; // Ajouter 'token' pour le code 2FA
  console.log('Données de connexion:', req.body); // Ajoutez ceci pour voir ce qui est envoyé
  try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      if (!user.isApproved) {
          return res.status(403).json({ message: "Votre compte n'est pas encore activé. Veuillez activer votre compte." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
      const token = generateToken(user.id);
      // Si 2FA est activée, envoyez le code de vérification
      if (user.twoFactorAuthEnabled) {
        const code = speakeasy.totp({ secret: user.twoFactorSecret, encoding: 'base32' });
        console.log('Code 2FA généré:', code);
        await sendTwoFactorAuthCode(user.email, code);
        return res.json({ 
          message: 'Code de vérification envoyé.', 
          twoFactorAuthEnabled: true,
          token,// Ajoutez cela pour renvoyer le token
        });
      }
      // Authentification réussie, enregistrez la connexion
      const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Obtenez l'IP de l'utilisateur
      await recordLogin(user.id, userIp); // Enregistrez l'historique de connexion
      


      
      console.log('Token généré:', token);
      res.json({
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
          twoFactorAuthEnabled: false,
      });
  } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
};


// Récupérer le profil utilisateur
const getProfile = async (req, res) => {
  try {
    console.log('User ID:', req.user.id); // Ajoutez ce log pour voir si l'utilisateur est bien trouvé
    const user = await User.findByPk(req.user.id);

    if (user) {
      console.log("tokenBalance:", user.tokenBalance);
      res.json({
        id: user.id,
        name: user.name,
        firstname: user.firstname,
        lastName: user.lastName,    // Nom
        email: user.email,
        phone: user.phone,
        address: user.address,       // Adresse
        cin: user.cin,               // CIN
        dateOfBirth: user.dateOfBirth, // Date de naissance
        gender: user.gender,         
        email: user.email,
        phone: user.phone,
        role: user.role,
        tokenBalance: user.tokenBalance,
        joinedOn: user.createdAt,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
// Mettre à jour le profil utilisateur
const updateProfile = async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    console.log('Fichier reçu:', req.file);

    const user = await User.findByPk(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.firstName = req.body.firstName || user.firstName; // Mise à jour du prénom
      user.lastName = req.body.lastName || user.lastName; 
      user.address = req.body.address || user.address;        // Mise à jour de l'adresse
      user.cin = req.body.cin || user.cin;                    // Mise à jour du CIN
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.gender = req.body.gender || user.gender;
      user.phone = req.body.phone || user.phone;
      user.email = req.body.email || user.email;

      if (req.file) {
        user.profilePicture = req.file.path.replace(/\\/g, '/'); // Remplacer les barres obliques inversées
      }

      await user.save(); // Sauvegarde l'utilisateur et force la mise à jour

      res.json({
        id: user.id,
        name: user.name,
        firstName: user.firstName,  // Prénom
        lastName: user.lastName,
        address: user.address,       // Adresse
        cin: user.cin,               // CIN
        dateOfBirth: user.dateOfBirth, // Date de naissance
        gender: user.gender,         // Genre
        role: user.role,   
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role,
        joinedOn: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

const resendActivationCode = async (req, res) => {
  const { email } = req.body;

  try {
    // Logique pour générer un nouveau code d'activation
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Mettre à jour le code d'activation dans la base de données
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.activationCode = activationCode;
    await user.save();

    // Envoyer le code d'activation par email
    sendActivationCodeEmail(email, activationCode);
    res.json({ message: 'Code d\'activation renvoyé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du renvoi du code d\'activation' });
  }
};

const getTokenBalance = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['tokenBalance'] });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.status(200).json({ balance: user.tokenBalance });
  } catch (error) {
    console.error('Erreur lors de la récupération du solde de tokens :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

//Fonction pour déconnexion
const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Récupérez le token du header Authorization
    
    if (!token) {
      return res.status(400).json({ message: 'Aucun token fourni' });
    }

    // Invalider le token (si vous utilisez un stockage côté serveur comme Redis ou une base de données)
    // Par exemple, si vous utilisez Redis, vous pouvez supprimer le token ainsi :
    // await redisClient.del(token);

    // Sinon, rien à faire si vous n'utilisez que des tokens JWT basés sur leur expiration.

    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
};

// Fonction pour gérer la demande de réinitialisation de mot de passe
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Générer un code ou un token de réinitialisation de mot de passe
    const resetToken = generateToken(user.id); // Vous pouvez utiliser un token JWT ou un autre moyen

     // Créer un lien de réinitialisation
     const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    
    // Envoyer l'email avec le lien de réinitialisation
    sendPasswordResetEmail(email, resetLink);

    res.json({ message: 'Un email de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Vérifiez le token et récupérez l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


// Exporter les fonctions
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  verifyActivationCode,
  resendActivationCode,// Ajoutez ici l'exportation de la fonction
  getTokenBalance,
  logoutUser,
  forgotPassword,
  resetPassword,
};

