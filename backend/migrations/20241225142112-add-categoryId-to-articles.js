module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('articles', 'categoryId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Permet de laisser temporairement des valeurs nulles
      references: {
        model: 'categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('articles', 'categoryId');
  },
};
