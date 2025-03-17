'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vendors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      articles: {
        type: Sequelize.INTEGER
      },
      auctionsStopped: {
        type: Sequelize.INTEGER
      },
      activeAuctions: {
        type: Sequelize.INTEGER
      },
      cancelledAuctions: {
        type: Sequelize.INTEGER
      },
      allAuctions: {
        type: Sequelize.INTEGER
      },
      auctionHistory: {
        type: Sequelize.INTEGER
      },
      salesHistory: {
        type: Sequelize.INTEGER
      },
      portfolio: {
        type: Sequelize.FLOAT
      },
      notifications: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vendors');
  }
};