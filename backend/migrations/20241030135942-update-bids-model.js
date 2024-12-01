'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('bids');

    // Ajout de `bidType` uniquement si elle n'existe pas déjà
    if (!tableInfo.bidType) {
      await queryInterface.addColumn('bids', 'bidType', {
        type: Sequelize.ENUM('manual', 'automatic'),
        allowNull: false,
      });
    }

    // Ajout de `maxAutoBidLimit` uniquement si elle n'existe pas déjà
    if (!tableInfo.maxAutoBidLimit) {
      await queryInterface.addColumn('bids', 'maxAutoBidLimit', {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }

    // Ajout de `remainingAutoBids` uniquement si elle n'existe pas déjà
    if (!tableInfo.remainingAutoBids) {
      await queryInterface.addColumn('bids', 'remainingAutoBids', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }

    // Suppression de `articleId` uniquement si elle existe
    if (tableInfo.articleId) {
      await queryInterface.removeColumn('bids', 'articleId');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Suppression des colonnes ajoutées dans `up`
    if (tableInfo.bidType) {
      await queryInterface.removeColumn('bids', 'bidType');
    }
    if (tableInfo.maxAutoBidLimit) {
      await queryInterface.removeColumn('bids', 'maxAutoBidLimit');
    }
    if (tableInfo.remainingAutoBids) {
      await queryInterface.removeColumn('bids', 'remainingAutoBids');
    }

    // Ré-ajout de `articleId` si nécessaire
    await queryInterface.addColumn('bids', 'articleId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Supprime le type ENUM `bidType` pour PostgreSQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_bids_bidType";');
  }
};

