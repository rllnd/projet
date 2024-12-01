'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('auctions');

    // Ajout de la colonne `maxAutoBid` si elle n'existe pas
    if (!tableInfo.maxAutoBid) {
      await queryInterface.addColumn('auctions', 'maxAutoBid', {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      });
    }

    // Ajout de la colonne `currentHighestBid` si elle n'existe pas
    if (!tableInfo.currentHighestBid) {
      await queryInterface.addColumn('auctions', 'currentHighestBid', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      });
    }

    // Ajout de la colonne `highestBidUserId` si elle n'existe pas
    if (!tableInfo.highestBidUserId) {
      await queryInterface.addColumn('auctions', 'highestBidUserId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    // Ajout de la colonne `status` si elle n'existe pas
    if (!tableInfo.status) {
      await queryInterface.addColumn('auctions', 'status', {
        type: Sequelize.ENUM('open', 'closed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
      });
    }

    // Ajout de la colonne `articleId` si elle n'existe pas
    if (!tableInfo.articleId) {
      await queryInterface.addColumn('auctions', 'articleId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }

    // Ajout de la colonne `endDate` si elle n'existe pas
    if (!tableInfo.endDate) {
      await queryInterface.addColumn('auctions', 'endDate', {
        type: Sequelize.DATE,
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Suppression des colonnes ajoutées dans `up`
    await queryInterface.removeColumn('auctions', 'maxAutoBid');
    await queryInterface.removeColumn('auctions', 'currentHighestBid');
    await queryInterface.removeColumn('auctions', 'highestBidUserId');
    await queryInterface.removeColumn('auctions', 'status');
    await queryInterface.removeColumn('auctions', 'articleId');
    await queryInterface.removeColumn('auctions', 'endDate');

    // Supprime le type ENUM pour `status` dans PostgreSQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_auctions_status";');
  }
};
