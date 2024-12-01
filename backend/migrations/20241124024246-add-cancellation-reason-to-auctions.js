module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Auctions', 'cancellationReason', {
      type: Sequelize.STRING, // ou Sequelize.TEXT si vous attendez des raisons longues
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Auctions', 'cancellationReason');
  },
};
