'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('GTCTransactions', 'type', {
      type: Sequelize.ENUM(
        'purchase',
        'sale',
        'reward',
        'spend',
        'transfer',
        'refund',
        'commission',
        'fee' // ✅ Ajout de la nouvelle valeur "fee"
      ),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // ⚠️ ATTENTION : On recrée l'ancienne version sans "fee"
    await queryInterface.changeColumn('GTCTransactions', 'type', {
      type: Sequelize.ENUM(
        'purchase',
        'sale',
        'reward',
        'spend',
        'transfer',
        'refund',
        'commission'
      ),
      allowNull: false,
    });
  }
};
