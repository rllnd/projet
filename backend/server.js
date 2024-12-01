const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const userRoutes = require('./routes/userRoutes'); 
const superadminRoutes = require('./routes/superadminRoutes');
const articleRoutes = require('./routes/articleRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const path = require('path');
const sequelize = require('./config/db'); // Instance Sequelize
const auctionRoutes = require('./routes/auctionRoutes');
const defineAssociations = require('./models/association');
const notificationRoutes = require('./routes/notificationRoutes');
const bidRoutes = require('./routes/bidRoutes');

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Spécifiez l'URL du frontend
  credentials: true // Autorise l'envoi de cookies et d'authentification
}));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/user', userRoutes);

app.use('/api/superadmin', superadminRoutes); // Enregistrement de la route superadmin
// Corrigez cette ligne
app.use('/api/articles', articleRoutes);

app.use('/api/transactions', transactionRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auctions', auctionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bids', bidRoutes);

console.log("Route /api/superadmin enregistrée");
// Démarrage du serveur


// Charger les relations entre modèles
defineAssociations();


// Synchroniser la base de données si nécessaire
sequelize.sync().then(() => {
  console.log('Base de données synchronisée avec succès');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
