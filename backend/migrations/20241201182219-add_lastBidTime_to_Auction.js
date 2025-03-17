module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Auctions', 'lastBidTime', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Auctions', 'lastBidTime');
  },
};
