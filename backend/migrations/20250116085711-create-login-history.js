module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('LoginHistories', {
          id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
          },
          userId: {
              type: Sequelize.INTEGER,
              references: {
                  model: 'Users',
                  key: 'id',
              },
              allowNull: false,
          },
          loginTime: {
              type: Sequelize.DATE,
              allowNull: false,
          },
          ipAddress: {
              type: Sequelize.STRING,
              allowNull: true,
          },
          createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
          },
      });
  },
  down: async (queryInterface) => {
      await queryInterface.dropTable('LoginHistories');
  },
};