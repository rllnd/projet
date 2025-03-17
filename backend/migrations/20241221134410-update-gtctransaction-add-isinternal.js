module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('GTCTransactions');

    // Vérifiez si la colonne 'isInternal' existe
    if (!tableDescription.isInternal) {
      await queryInterface.addColumn('GTCTransactions', 'isInternal', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    // Modifier les colonnes existantes
    await queryInterface.changeColumn('GTCTransactions', 'operator', {
      type: Sequelize.STRING,
      allowNull: true, // Permettre null pour certaines transactions
    });

    await queryInterface.changeColumn('GTCTransactions', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true, // Permettre null pour certaines transactions
    });
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('GTCTransactions');

    // Supprimer la colonne si elle existe
    if (tableDescription.isInternal) {
      await queryInterface.removeColumn('GTCTransactions', 'isInternal');
    }

    // Réinitialiser les colonnes modifiées
    await queryInterface.changeColumn('GTCTransactions', 'operator', {
      type: Sequelize.STRING,
      allowNull: false, // Remettre l'ancien comportement si nécessaire
    });

    await queryInterface.changeColumn('GTCTransactions', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
