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
  autoBidActive: {  // ✅ Ajout de ce champ
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  highestBidUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  lastBidTime: {
    type: DataTypes.DATE,
    allowNull: true, // Null lorsqu'il n'y a pas encore d'enchères
  },
  
  lastAutoBidTime: { // Dernière enchère (manuel ou AutoBid)
    type: DataTypes.DATE,
    allowNull: true,
  },

  finalizedAt: { // Ajout de finalizedAt
    type: DataTypes.DATE,
    allowNull: true, // Peut être nul si l'enchère est encore ouverte
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
