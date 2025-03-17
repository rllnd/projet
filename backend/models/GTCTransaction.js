const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const GTCTransaction = sequelize.define('GTCTransaction', {
  type: {
    type: DataTypes.ENUM('purchase', 'sale', 'reward', 'spend', 'transfer','refund','escrow', 'commission','fee'),
    allowNull: false, // Type de transaction
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false, // Montant des GTC
    validate: {
      min: 0.01, // Minimum pour éviter les montants nuls ou négatifs
    },
  },
  receiverPhoneNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Numéro qui reçoit les fonds
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // Détails supplémentaires sur la transaction
  },
  operator: {
    type: DataTypes.STRING,
    allowNull: true, // Facultatif pour les transactions internes
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Facultatif pour les transactions internes
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true, // ID de la transaction retourné par l'opérateur
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Indique si la transaction a été réussie
  },
  saleAmount: {
    type: DataTypes.FLOAT,
    allowNull: true, // Montant obtenu en monnaie réelle
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending', // Nouvel attribut pour suivre l'état de la transaction
  },
  conversionRateId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null si aucune conversion n'est associée
    references: {
      model: 'ConversionRates',
      key: 'id',
    },
  },
  appliedConversionRate: { // Renommé pour éviter le conflit
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0, // Par défaut 1:1
  },
  auctionId: { // Ajout de la relation avec Auction
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Auctions',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // ID de l'utilisateur effectuant la transaction
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Indique si la transaction est interne
  },
},
{
  timestamps: true, // Inclut createdAt et updatedAt
  validate: {
    validateTransaction() {
      // Vérifie que `userId` est requis pour toutes les transactions sauf "commission" et internes
      if (!this.isInternal && this.type !== 'commission' && !this.userId) {
        throw new Error('userId est obligatoire pour cette transaction.');
      }
  
      // Vérifie que `operator` et `phoneNumber` sont requis pour les transactions externes
      if (!this.isInternal && (!this.operator || !this.phoneNumber)) {
        throw new Error('Operator et PhoneNumber sont obligatoires pour les transactions externes.');
      }
  
      // Vérifie que `userId` est null pour les commissions
      if (this.type === 'commission' && this.userId) {
        throw new Error('userId ne doit pas être défini pour une transaction de type commission.');
      }
    },
  },
   
});

module.exports = GTCTransaction;
