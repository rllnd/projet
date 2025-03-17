'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('GTCTransactions', 'saleAmount', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('GTCTransactions', 'conversionRate', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 1.0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('GTCTransactions', 'saleAmount');
    await queryInterface.removeColumn('GTCTransactions', 'conversionRate');
  },
};
