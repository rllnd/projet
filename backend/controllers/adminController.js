// controllers/adminController.js
const User = require('../models/User');

// Obtenir tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role','phone', 'createdAt'],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
      await user.save();
      res.json({ message: 'Utilisateur mis à jour avec succès' });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
};
