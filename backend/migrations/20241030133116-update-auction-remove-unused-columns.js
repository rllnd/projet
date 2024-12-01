'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Supprime les colonnes qui ne sont plus dans le modèle Auction
    await queryInterface.removeColumn('auctions', 'title');
    await queryInterface.removeColumn('auctions', 'description');
    await queryInterface.removeColumn('auctions', 'startingPrice');
    await queryInterface.removeColumn('auctions', 'currentBid');
    await queryInterface.removeColumn('auctions', 'userId');
  },

  down: async (queryInterface, Sequelize) => {
    // Ajoute à nouveau les colonnes en cas de rollback
    await queryInterface.addColumn('auctions', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('auctions', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('auctions', 'startingPrice', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.addColumn('auctions', 'currentBid', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    });
    await queryInterface.addColumn('auctions', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};
