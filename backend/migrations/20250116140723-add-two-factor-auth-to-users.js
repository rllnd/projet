'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajout des colonnes pour la vérification en deux étapes
    await queryInterface.addColumn('Users', 'twoFactorAuthEnabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('Users', 'twoFactorSecret', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Suppression des colonnes ajoutées
    await queryInterface.removeColumn('Users', 'twoFactorAuthEnabled');
    await queryInterface.removeColumn('Users', 'twoFactorSecret');
  }
};