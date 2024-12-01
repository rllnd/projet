'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bids', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      auctionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'auctions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      bidType: {
        type: Sequelize.ENUM('manual', 'automatic'),
        allowNull: false,
      },
      maxAutoBidLimit: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      remainingAutoBids: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bidTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM('active', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'active',
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
    await queryInterface.dropTable('bids');
  },
};
