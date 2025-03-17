module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GTCTransactions');
  },

  down: async (queryInterface, Sequelize) => {
    // Optionnel : Si vous voulez recréer l'ancienne table en cas de rollback
    await queryInterface.createTable('GTCTransactions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM('purchase', 'sale', 'reward', 'spend', 'transfer'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      receiverPhoneNumber: Sequelize.STRING,
      description: Sequelize.TEXT,
      operator: Sequelize.STRING,
      phoneNumber: Sequelize.STRING,
      transactionId: Sequelize.STRING,
      success: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      saleAmount: Sequelize.FLOAT,
      conversionRateId: Sequelize.INTEGER,
      appliedConversionRate: {
        type: Sequelize.FLOAT,
        defaultValue: 1.0,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      isInternal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
};
