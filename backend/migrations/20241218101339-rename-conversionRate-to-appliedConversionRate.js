'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('GTCTransactions', 'conversionRate', 'appliedConversionRate');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('GTCTransactions', 'appliedConversionRate', 'conversionRate');
  },
};
