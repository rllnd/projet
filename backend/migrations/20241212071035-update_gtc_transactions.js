'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GTCTransactions', 'operator', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('GTCTransactions', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('GTCTransactions', 'transactionId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('GTCTransactions', 'success', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GTCTransactions', 'operator');
    await queryInterface.removeColumn('GTCTransactions', 'phoneNumber');
    await queryInterface.removeColumn('GTCTransactions', 'transactionId');
    await queryInterface.removeColumn('GTCTransactions', 'success');
  },
};
