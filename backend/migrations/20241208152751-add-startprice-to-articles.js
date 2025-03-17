'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('articles', 'startPrice', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // Valeur par défaut
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('articles', 'startPrice');
  }
};
