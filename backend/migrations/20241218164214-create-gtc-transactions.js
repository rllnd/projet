module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GTCTransactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
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
          model: 'ConversionRates', // Nom de la table des taux de conversion
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
          model: 'Users', // Nom de la table des utilisateurs
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GTCTransactions');
  },
};
