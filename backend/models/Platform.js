const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assurez-vous que ce chemin pointe vers votre configuration Sequelize

const Platform = sequelize.define('Platform', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  minPurchaseLimit: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  maxPurchaseLimit: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  auctionFee: {  // ✅ Ajout des frais d’enchère définis par l’admin
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 5, // Définir une valeur par défaut
    validate: {
      isFloat: true,
      min: 1, // Assurer que le montant est toujours valide
    },
  },
  minSaleLimit: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
  maxSaleLimit: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
    },
  },
}, {
  tableName: 'platform',
  timestamps: true,
});

module.exports = Platform;
