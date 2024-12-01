const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

// Récupérer toutes les notifications pour un utilisateur
router.get('/', protect, notificationController.getUserNotifications);

// Récupérer le nombre de notifications non lues
router.get('/unread', protect, notificationController.getUnreadNotificationCount);

// Marquer toutes les notifications comme lues
router.put('/mark-as-read', protect, notificationController.markNotificationsAsRead);


module.exports = router;
