const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['buyer', 'seller']], // Limite les valeurs acceptées à "buyer" ou "seller"
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true, // Optionnel
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true, // Optionnel
  },
  tokenBalance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0, // Solde de jetons par défaut
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Par défaut, l'utilisateur n'est pas approuvé
  },
  activationCode: { // Ajout du champ activationCode
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});



module.exports = User;
