module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIn: [['buyer', 'seller']],
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
