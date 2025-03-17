module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE GTCTransactions 
      MODIFY COLUMN type ENUM(
        'purchase', 'sale', 'reward', 'spend', 'transfer', 'refund', 'commission', 'fee', 'escrow'
      ) NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE GTCTransactions 
      MODIFY COLUMN type ENUM(
        'purchase', 'sale', 'reward', 'spend', 'transfer', 'refund', 'commission', 'fee'
      ) NOT NULL;
    `);
  }
};
