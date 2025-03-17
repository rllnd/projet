'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('platform', 'minPurchaseLimit', {
      type: Sequelize.FLOAT,
      allowNull: true, // Permet des valeurs nulles pour les données existantes
      validate: {
        isFloat: true,
        min: 0,
      },
    });

    await queryInterface.addColumn('platform', 'maxPurchaseLimit', {
      type: Sequelize.FLOAT,
      allowNull: true, // Permet des valeurs nulles pour les données existantes
      validate: {
        isFloat: true,
        min: 0,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('platform', 'minPurchaseLimit');
    await queryInterface.removeColumn('platform', 'maxPurchaseLimit');
  },
};
