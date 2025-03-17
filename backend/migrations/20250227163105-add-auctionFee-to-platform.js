module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('platform', 'auctionFee', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 5, // Valeur initiale par défaut
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('platform', 'auctionFee');
  }
};
