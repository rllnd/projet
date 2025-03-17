// routes/faqRoutes.js
const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

router.get('/', faqController.getAllFAQs);
router.post('/', faqController.createFAQ);

router.put('/:id', faqController.updateFAQ);
//suppression d'une FAQ
router.delete('/:id', faqController.deleteFAQ);
router.patch('/:id/publish', faqController.publishFAQ); // Utilisez PATCH pour mettre à jour une partie de la ressource

module.exports = router;