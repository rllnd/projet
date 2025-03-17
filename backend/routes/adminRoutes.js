const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditLogger'); // Middleware d'audit

// Route pour lister les administrateurs (Pas besoin d'audit ici)
router.get('/admins', protect, adminController.getAllAdmins);

// Route pour ajouter un administrateur (On enregistre l'audit)
router.post('/admins', protect, auditLogger, adminController.createAdmin);

// Route pour supprimer un administrateur (On enregistre l'audit)
router.delete('/admins/:id', protect, auditLogger, adminController.deleteAdmin);

// Route pour récupérer l'overview administrateur (Pas besoin d'audit)
router.get('/overview', protect, adminController.getAdminOverview);

module.exports = router;
