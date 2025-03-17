module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GTCTransactions', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Permet NULL
      references: {
        model: 'Users', // Nom de la table utilisateur
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GTCTransactions', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false, // Revenir à NOT NULL si vous annulez la migration
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },
};
