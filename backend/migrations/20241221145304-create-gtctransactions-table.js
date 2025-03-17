module.exports = {
  up: async (queryInterface, Sequelize) => {
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
        validate: { min: 0.01 },
      },
      receiverPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      operator: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      success: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      saleAmount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      conversionRateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ConversionRates',
          key: 'id',
        },
      },
      appliedConversionRate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1.0,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      isInternal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GTCTransactions');
  },
};
