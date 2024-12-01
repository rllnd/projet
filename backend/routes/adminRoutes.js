// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

// Obtenir tous les utilisateurs
router.get('/users', protect, admin, getAllUsers);

// Mettre à jour un utilisateur
router.put('/users/:id', protect, admin, updateUser);

// Supprimer un utilisateur
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
