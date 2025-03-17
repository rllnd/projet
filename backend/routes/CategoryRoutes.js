const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditLogger'); 
// Routes CRUD pour les catégories
//créer une catégorie
router.post('/create', protect,auditLogger, categoryController.createCategory); // Créer une catégorie

router.get('/list', protect, categoryController.getCategories); // Lire toutes les catégories
router.get('/view/:id', protect, categoryController.getCategoryById); // Lire une catégorie par ID
//Mis à jour d'une catégorie
router.put('/update/:id', protect, categoryController.updateCategory); // Mettre à jour une catégorie
//suppression d'une catégorie
router.delete('/delete/:id', protect, auditLogger, categoryController.deleteCategory); // Supprimer une catégorie

module.exports = router;
