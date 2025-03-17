'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ajoute les types "refund" et "commission" à l'énumération "type"
    await queryInterface.changeColumn('GTCTransactions', 'type', {
      type: Sequelize.ENUM('purchase', 'sale', 'reward', 'spend', 'transfer', 'refund', 'commission'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revenir à l'ancienne énumération sans "refund" et "commission"
    await queryInterface.changeColumn('GTCTransactions', 'type', {
      type: Sequelize.ENUM('purchase', 'sale', 'reward', 'spend', 'transfer'),
      allowNull: false,
    });
  },
};
