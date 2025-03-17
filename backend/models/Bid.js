const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Chemin vers votre configuration Sequelize
const Auction = require('./Auction');
const User = require('./User');

const Bid = sequelize.define('Bid', {
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Auction, key: 'id' },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 1 },
  },
  bidTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active',
  },
  isAutoBid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // False pour les enchères manuelles
  },
  reserved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Indique si les fonds sont réservés pour l'enchère
  },
  refunded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Par défaut, l'enchère n'est pas remboursée
  },
}, {
  tableName: 'bids',
  timestamps: true,
});

module.exports = Bid;
