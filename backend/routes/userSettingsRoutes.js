const express = require('express');
const UserSettingController = require('../controllers/UserSettingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Routes pour les paramètres utilisateur
router.put('/change-password', protect, UserSettingController.changePassword);
router.get('/recent-transactions', protect, UserSettingController.getRecentTransactions);
router.get('/balance', protect, UserSettingController.getBalanceHistory);
router.get('/profile', protect, UserSettingController.getProfile);
router.delete('/delete-account', protect, UserSettingController.deleteAccount);

// Routes ajoutées
router.put('/notification-preferences', protect, UserSettingController.updateNotificationPreferences);
router.get('/login-history', protect, UserSettingController.getLoginHistory);
router.put('/two-factor-auth', protect, UserSettingController.updateTwoFactorAuth);
// Routes pour la vérification en deux étapes
// userRoutes.js
router.post('/two-factor-auth/enable', protect, UserSettingController.enableTwoFactorAuth);
router.post('/two-factor-auth/verify', protect, UserSettingController.verifyTwoFactorAuth);
router.post('/two-factor-auth/send-code', protect, UserSettingController.sendVerificationCode);

module.exports = router;