const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Connexion Sequelize
const User = require('./User');

const Article = sequelize.define('Article', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  shortDesc: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255],
    },
  },
  fullDesc: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imgUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gallery: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Relie au modèle User
      key: 'id',
    },
  },
  isAuctioned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
 
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'articles',
  timestamps: true, // Inclut createdAt et updatedAt
});


module.exports = Article;
