// models/Platform.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Connexion Sequelize

const Platform = sequelize.define('Platform', {
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 100000, // Initialise avec un solde de 100,000 tokens
  },
}, {
  tableName: 'platform',
  timestamps: true, // Inclut createdAt et updatedAt
});

module.exports = Platform;
