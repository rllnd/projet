module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('auctions', 'lastAutoBidTime', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null, // 🔥 Ne perturbe pas les données existantes
      after: "lastBidTime", // Optionnel : place la colonne après `lastBidTime`
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('auctions', 'lastAutoBidTime');
  }
};
