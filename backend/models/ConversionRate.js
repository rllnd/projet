const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

// Définition du modèle ConversionRate
const ConversionRate = sequelize.define('ConversionRate', {
  fromCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ARIARY' // Conversion à partir de l'Ariary
  },
  toCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'TOKEN' // Conversion vers les jetons
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false // Taux de conversion entre Ariary et Token
  }
}, {
  timestamps: true
});

module.exports = ConversionRate;
