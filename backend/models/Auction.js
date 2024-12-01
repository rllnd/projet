const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Chemin vers votre configuration Sequelize
const Article = require('./Article');
const User = require('./User');

const Auction = sequelize.define('Auction', {
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Article, key: 'id' },
  },
  maxAutoBid: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
  },
  currentHighestBid: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  highestBidUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'cancelled'),
    allowNull: false,
    defaultValue: 'open',
  },
  cancellationReason: {
    type: DataTypes.STRING, // Utilisez STRING ou TEXT selon la longueur prévue
    allowNull: true, // Peut être nul tant qu'il n'est pas annulé
  },
}, {
  tableName: 'auctions',
  timestamps: true,
});

module.exports = Auction;
