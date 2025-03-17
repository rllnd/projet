const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Mettez à jour le chemin selon votre structure de projet

class Vendor extends Model {}

Vendor.init({
  articles: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  auctionsStopped: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  activeAuctions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cancelledAuctions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  allAuctions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  auctionHistory: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  salesHistory: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  portfolio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  notifications: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Vendor',
  tableName: 'Vendors', // Assurez-vous que cela correspond au nom de la table
});

module.exports = Vendor;