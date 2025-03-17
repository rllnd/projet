const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Auction = require('./Auction');
const User = require('./User');

const AutoBid = sequelize.define('AutoBid', {
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Auction, key: 'id' },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
  },
  maxBidAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'AutoBids',
  timestamps: true,
});


module.exports = AutoBid;
