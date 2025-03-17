const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Votre configuration Sequelize
const User = require('./User'); // Le modèle User
const Notification = sequelize.define('Notification', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Relation avec le modèle User
      key: 'id',
    },
  },
  
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Par défaut, une notification est non lue
  },
}, {
  tableName: 'notifications',
  timestamps: true, // Pour inclure createdAt et updatedAt
});

module.exports = Notification;
