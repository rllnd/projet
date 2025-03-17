// controllers/faqController.js
const FAQ = require('../models/FAQ');

// Récupérer toutes les FAQ
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ajouter une nouvelle FAQ
exports.createFAQ = async (req, res) => {
  const { question, answer } = req.body;

  try {
    const newFAQ = await FAQ.create({ question, answer });
    res.status(201).json(newFAQ);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Mettre à jour une FAQ existante
exports.updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  try {
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).send('FAQ non trouvée');

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    await faq.save();
    res.json(faq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer une FAQ
exports.deleteFAQ = async (req, res) => {
  const { id } = req.params;

  try {
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).send('FAQ non trouvée');

    await faq.destroy();
    res.json({ message: 'FAQ supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Publier/Dépublier une FAQ
exports.publishFAQ = async (req, res) => {
  const { id } = req.params;
  const { published } = req.body; // Le nouveau statut de publication

  try {
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).send('FAQ non trouvée');

    faq.published = published; // Mettre à jour le statut de publication
    await faq.save();

    res.json(faq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};