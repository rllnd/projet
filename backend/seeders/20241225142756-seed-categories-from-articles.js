module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Récupérer les noms uniques des catégories existantes
    const categories = await queryInterface.sequelize.query(
      `SELECT DISTINCT category FROM articles;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Insérer les catégories dans la table `categories`
    const categoryData = categories.map((cat) => ({
      name: cat.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await queryInterface.bulkInsert('categories', categoryData);

    // Récupérer les catégories insérées
    const insertedCategories = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Mapper les articles existants aux catégories
    for (const { id, name } of insertedCategories) {
      await queryInterface.sequelize.query(
        `UPDATE articles SET categoryId = ${id} WHERE category = '${name}';`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.sequelize.query(`UPDATE articles SET categoryId = NULL;`);
  },
};
