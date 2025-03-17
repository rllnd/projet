'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConversionRates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      fromCurrency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'GTC', // Conversion à partir de GTC
      },
      toCurrency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'MGA', // Conversion vers MGA
      },
      rate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0.01, // Évite les taux nuls ou négatifs
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ConversionRates');
  },
};
