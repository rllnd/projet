const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    },
  firstName: {  // Ajout du champ Prénom
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {  // Ajout du champ Nom
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
      isIn: [['buyer', 'seller']],
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tokenBalance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  escrowBalance: {  // ✅ Portefeuille sécurisé (fonds bloqués)
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  activationCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {  // Ajout du champ Adresse
    type: DataTypes.STRING,
    allowNull: true,
  },
  cin: {  // Ajout du champ CIN
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: {  // Ajout du champ Date de Naissance
    type: DataTypes.DATE,
    allowNull: true,
  },
  
  gender: {  // Ajout du champ Genre
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  twoFactorAuthEnabled: {  // Champ pour la vérification en deux étapes
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  twoFactorSecret: {  // Champ pour stocker le secret de 2FA
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = User;