module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'isApproved', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Définir la validation par défaut comme non approuvée
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'isApproved');
  },
};
