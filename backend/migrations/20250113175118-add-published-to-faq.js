'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('FAQs', 'published', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // Par défaut, ne pas publié
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('FAQs', 'published');
  },
};