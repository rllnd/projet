module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('auctions', 'autoBidActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('auctions', 'autoBidActive');
  }
};
