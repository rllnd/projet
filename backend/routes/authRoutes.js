const express = require('express');
const { registerUser, loginUser, getProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Route pour l'inscription d'un utilisateur
router.post('/register', registerUser);

// Route pour la connexion d'un utilisateur
router.post('/login', loginUser);

// Route pour obtenir le profil utilisateur (nécessite un token JWT)
router.get('/profile', protect, getProfile);

module.exports = router;
