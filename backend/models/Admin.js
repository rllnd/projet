const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assurez-vous que ce chemin est correct

const Admin = sequelize.define('Admin', {
  id_admin: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
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
    type: DataTypes.ENUM('superadmin'),
    allowNull: false,
    defaultValue: 'superadmin',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'Admins',
});

module.exports = Admin;
