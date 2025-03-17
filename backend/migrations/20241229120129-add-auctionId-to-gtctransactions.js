module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GTCTransactions', 'auctionId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Auctions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GTCTransactions', 'auctionId');
  },
};
