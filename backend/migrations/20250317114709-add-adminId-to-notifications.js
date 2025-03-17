module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('notifications', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Peut être null si la notification est pour un utilisateur
      references: {
        model: 'admins', // Assurez-vous que la table admins existe
        key: 'id_admin',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('notifications', 'adminId');
  }
};
