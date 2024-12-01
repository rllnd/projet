'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bids', 'isAutoBid', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Par défaut, False
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bids', 'isAutoBid');
  },
};
