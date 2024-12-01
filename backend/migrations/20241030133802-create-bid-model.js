'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bids', {
      // Clé primaire pour chaque enchère
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      // ID de l'utilisateur qui place l'enchère
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Table des utilisateurs
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // ID de l'article sur lequel l'enchère est placée
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'articles', // Table des articles
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Montant de l'enchère
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      // Date et heure de l'enchère
      bidTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      // Statut de l'enchère (active, annulée, expirée)
      status: {
        type: Sequelize.ENUM('active', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'active',
      },
      // Dates de création et de mise à jour
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
    // Supprime la table `bids` et le type ENUM pour le statut
    await queryInterface.dropTable('bids');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_bids_status";'); // Supprime le type ENUM PostgreSQL pour `status`
  }
};
