'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GTCTransactions', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Permettre les valeurs nulles pour userId
      references: {
        model: 'Users', // Nom de la table Users
        key: 'id', // Clé étrangère
      },
      onDelete: 'CASCADE', // Gérer les suppressions
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GTCTransactions', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false, // Remettre la contrainte de non-null
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },
};
