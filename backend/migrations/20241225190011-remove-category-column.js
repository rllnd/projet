module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('articles', 'category');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('articles', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
