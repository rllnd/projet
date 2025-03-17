const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

// Définition du modèle ConversionRate
const ConversionRate = sequelize.define('ConversionRate', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Définit le champ comme clé primaire
    autoIncrement: true, // Active l'auto-incrémentation
    allowNull: false,
  },
  fromCurrency: { 
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'GTC', // Conversion à partir de GTC
  },
  toCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'MGA', // Conversion vers l'Ariary
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false, // Taux de conversion entre GTC et Ariary
    validate: {
      min: 0.01, // Évite les taux nuls ou négatifs
    },
  },
}, {
  timestamps: true,
});

module.exports = ConversionRate;
