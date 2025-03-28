module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bids', 'refunded', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('bids', 'refunded');
  },
};
