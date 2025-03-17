'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ConversionRates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fromCurrency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ARIARY',
      },
      toCurrency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'TOKEN',
      },
      rate: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ConversionRates');
  },
};
