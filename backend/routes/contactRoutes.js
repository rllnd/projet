const express = require('express');
const {
  sendContactEmail,
  getAllMessages,
  deleteMessage,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditLogger'); 
const router = express.Router();

// Route pour envoyer un message de contact
router.post('/contact',protect, sendContactEmail);

// Route pour récupérer tous les messages
router.get('/messages', getAllMessages);

// Route pour supprimer un message
router.delete('/messages/:id', auditLogger, deleteMessage);

module.exports = router;