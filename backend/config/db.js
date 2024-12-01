const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT,
  logging: false, // Optionnel, désactive les logs SQL
});

sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données réussie'))
  .catch(err => console.error('Impossible de se connecter à la base de données :', err));

module.exports = sequelize;
