'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auctions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'articles', // Nom de la table des articles
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      maxAutoBid: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
      currentHighestBid: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      highestBidUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users', // Nom de la table des utilisateurs
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('open', 'closed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auctions');
  },
};
