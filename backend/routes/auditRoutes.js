const express = require('express');
const router = express.Router();
const { getAuditLogs, createAuditLog, generateAuditReport } = require('../controllers/auditController');

// 🔹 Récupérer tous les logs d’audit
router.get('/get', getAuditLogs);

// 🔹 Enregistrer un audit log manuellement (utile pour les tests)
router.post('/create', createAuditLog);

// 🔹 Télécharger un rapport d’audit en PDF
router.get('/generate', generateAuditReport);

module.exports = router;
