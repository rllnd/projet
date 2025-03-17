const Category = require('../models/Category');

// Fonction pour créer une catégorie
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Créer la catégorie
    const newCategory = await Category.create({ name, description });

    return res.status(201).json({ message: 'Catégorie créée avec succès!', category: newCategory });
  } catch (error) {
    // Gestion des erreurs
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Le nom de la catégorie doit être unique.' });
    }

    console.error('Erreur lors de la création de la catégorie:', error);
    return res.status(500).json({ message: "Erreur lors de la création de la catégorie." });
  }
};

// Lire toutes les catégories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.status(200).json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des catégories." });
  }
};

// Lire une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la catégorie." });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    category.name = name || category.name;
    category.description = description || category.description;

    await category.save();

    res.status(200).json({
      message: "Catégorie mise à jour avec succès.",
      category,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la catégorie." });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    await category.destroy();

    res.status(200).json({ message: "Catégorie supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression de la catégorie." });
  }
};
