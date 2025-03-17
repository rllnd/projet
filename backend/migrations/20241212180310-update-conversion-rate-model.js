'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Met à jour les colonnes existantes
    await queryInterface.changeColumn('ConversionRates', 'fromCurrency', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'GTC',
    });
    await queryInterface.changeColumn('ConversionRates', 'toCurrency', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'MGA',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revenir aux anciennes valeurs si nécessaire
    await queryInterface.changeColumn('ConversionRates', 'fromCurrency', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'MGA',
    });
    await queryInterface.changeColumn('ConversionRates', 'toCurrency', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'GTC',
    });
  },
};
