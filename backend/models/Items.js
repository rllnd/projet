const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Auction = require('./Auction');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  initialPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  auctionId: {
    type: DataTypes.INTEGER,
    references: {
      model: Auction,
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

Auction.hasMany(Item, { foreignKey: 'auctionId' });
Item.belongsTo(Auction, { foreignKey: 'auctionId' });

module.exports = Item;
