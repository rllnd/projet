// models/faq.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class FAQ extends Model {}

FAQ.init({
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'FAQ',
});

module.exports = FAQ;