'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('platform', 'minSaleLimit', {
      type: Sequelize.FLOAT,
      allowNull: true,
      validate: {
        isFloat: true,
        min: 0,
      },
    });

    await queryInterface.addColumn('platform', 'maxSaleLimit', {
      type: Sequelize.FLOAT,
      allowNull: true,
      validate: {
        isFloat: true,
        min: 0,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('platform', 'minSaleLimit');
    await queryInterface.removeColumn('platform', 'maxSaleLimit');
  },
};
