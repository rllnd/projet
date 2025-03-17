module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GTCTransactions', 'status', {
      type: Sequelize.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GTCTransactions', 'status');
  },
};
