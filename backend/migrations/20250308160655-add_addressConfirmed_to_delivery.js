"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Deliveries", "addressConfirmed", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false, // 🚨 Toutes les anciennes adresses sont considérées comme "non confirmées"
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Deliveries", "addressConfirmed");
  },
};
