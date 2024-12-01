const Admin = require('../models/Admin');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Platform = require('../models/Platform');

exports.loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont obligatoires.' });
  }

  try {
    const superAdmin = await Admin.findOne({ where: { email, role: 'superadmin' } });

    if (!superAdmin) {
      return res.status(401).json({ message: 'Super Admin non trouvé.' });
    }

    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: superAdmin.id_admin, role: superAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log("Token généré :", token);

    res.json({
      token,
      role: superAdmin.role,
      message: 'Connexion réussie.',
    });
  } catch (error) {
    console.error('Erreur lors de la connexion du Super Admin :', error);
    res.status(500).json({ message: 'Erreur du serveur.', error: error.message });
  }
};


exports.getPlatformBalance = async (req, res) => {
  try {
    const platform = await Platform.findOne();
    if (!platform) {
      return res.status(404).json({ message: 'Solde de la plateforme non trouvé' });
    }
    res.json({ platformBalance: platform.balance });
  } catch (error) {
    console.error("Erreur lors de la récupération du solde de la plateforme :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};



// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error });
  }
};

// Approuver un utilisateur
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.isApproved = true;
    await user.save();
    res.json({ message: "Utilisateur approuvé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'approbation de l'utilisateur", error });
  }
};

// Désactiver un utilisateur
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.isApproved = false;
    await user.save();
    res.json({ message: "Utilisateur désactivé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la désactivation de l'utilisateur", error });
  }
};
