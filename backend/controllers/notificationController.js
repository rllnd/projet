const Notification = require('../models/Notifications');

// Récupérer les notifications pour un utilisateur
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
exports.getUnreadNotificationCount = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const unreadCount = await Notification.count({
        where: { userId, isRead: false },
      });
  
      res.status(200).json({ count: unreadCount });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };
  exports.markNotificationsAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
  
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
  
      res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues.' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };
  exports.createNotification = async (userId, message) => {
    try {
      await Notification.create({
        userId,
        message,
        isRead: false,
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification :', error);
    }
  };
      