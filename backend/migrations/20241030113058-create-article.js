'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('articles', {
      // Clé primaire de l'article
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      
      // Nom de l'article
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      
      // Catégorie de l'article
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      
      // Prix de départ de l'article
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0, // Prix de départ par défaut
      },
      
      // Description courte pour l'aperçu
      shortDesc: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      
      // Description complète pour la page de détails
      fullDesc: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      
      // URL de l'image principale de l'article
      imgUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      // Galerie d'images supplémentaires (tableau JSON de chaînes de caractères)
      gallery: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      
      // Statut de validation de l'article par l'administrateur
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      
      // Date de publication (définie lors de l'approbation)
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      
      // Date de fin de l'enchère
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      
      // ID du vendeur (clé étrangère vers la table users)
      sellerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Nom de la table utilisateur, supposant que le modèle User est lié à cette table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      
      // Date de création de l'article
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      
      // Date de mise à jour de l'article
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Supprime la table articles en cas de rollback
    await queryInterface.dropTable('articles');
  }
};
