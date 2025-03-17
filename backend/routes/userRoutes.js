const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, verifyActivationCode,resendActivationCode,getTokenBalance,logoutUser,forgotPassword, resetPassword } = require('../controllers/userController'); // Importer les fonctions depuis userController
const { protect } = require('../middleware/authMiddleware'); // Si tu utilises un middleware pour protéger les routes
const router = express.Router();
const multer = require('multer');

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où seront stockés les fichiers
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Nommer les fichiers de manière unique
  }
});

// Initialisation de multer avec la configuration de stockage
const upload = multer({ storage: storage });

// Route d'inscription avec gestion des fichiers via `multer`
router.post('/register', upload.single('profilePicture'), registerUser);

// Route pour la connexion
router.post('/login', loginUser);

// Route pour obtenir le profil utilisateur (requiert une authentification)
router.get('/profile', protect, getProfile);

//router.put('/profile', protect, updateProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

router.post('/resend-activation-code', resendActivationCode);


router.post('/activate-account', verifyActivationCode);
router.get('/token-balance', protect, getTokenBalance);
// Route pour la déconnexion
router.post('/logout', logoutUser);

// Route pour demander un lien de réinitialisation de mot de passe
router.post('/forgot-password', forgotPassword);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', resetPassword);


module.exports = router;
