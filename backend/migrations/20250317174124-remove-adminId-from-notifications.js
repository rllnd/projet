module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Suppression de la colonne adminId de la table notifications
    return queryInterface.removeColumn('notifications', 'adminId');
  },

  down: async (queryInterface, Sequelize) => {
    // Ré-ajout de la colonne adminId (au cas où on veut annuler la migration)
    return queryInterface.addColumn('notifications', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'admins',
        key: 'id_admin',
      },
      onDelete: 'CASCADE',
    });
  }
};
