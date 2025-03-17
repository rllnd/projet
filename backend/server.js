const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Serveur HTTP
const { Server } = require('socket.io'); // Socket.IO

const sequelize = require('./config/db'); // Base de données
const defineAssociations = require('./models/association');
const initializePlatform = require('./script/initializePlatform'); 

// Import des routes
const userRoutes = require('./routes/userRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const articleRoutes = require('./routes/articleRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bidRoutes = require('./routes/bidRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const conversionRateRoutes = require('./routes/conversionRateRoutes');
const PlateBalanceRoutes = require('./routes/PlateBalanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminTransactionRoutes = require('./routes/adminTransactionRoutes');
const CategoryRoutes = require('./routes/CategoryRoutes');
const faqRoutes = require('./routes/faqRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userSettingsRoutes = require('./routes/userSettingsRoutes');
const vendorRoutes = require('./routes/vendorRoutes'); // Importer les routes
const dashboardRoutes = require('./routes/dashboardRoutes'); // Assurez-vous que le chemin est correct
const auditRoutes = require('./routes/auditRoutes');
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminDeliveryRoutes = require('./routes/admindeliveryRoutes');
const adminRevenueRoutes = require('./routes/adminRevenueRoutes');



dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Charger WebSocket séparément
require('./config/socket')(io);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Routes API
app.use('/api/auth', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auctions', auctionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/conversion-rate', conversionRateRoutes);
app.use('/api/platform', PlateBalanceRoutes);
app.use('/api', adminRoutes);
app.use('/api', adminTransactionRoutes);
app.use('/api', CategoryRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api', contactRoutes);
app.use('/api', userSettingsRoutes);
// Utiliser les routes des vendeurs
app.use('/api/vendors', vendorRoutes);
// Utilisation des routes de tableau de bord
app.use('/api', dashboardRoutes);
app.use('/api/audit', auditRoutes);
//utiliser les routes pour les livraisons
app.use("/api/deliveries", deliveryRoutes);
app.use('/api/admin', adminDeliveryRoutes);
//revenue de plateforme
app.use('/api/admin', adminRevenueRoutes);



require('./Scheduler/Scheduler');
// Chargement des relations entre modèles
defineAssociations();




// Synchroniser la base de données et initialiser la plateforme
sequelize.sync().then(async () => {
  console.log('Base de données synchronisée avec succès');

  try {
    await initializePlatform();
    console.log('Plateforme initialisée avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la plateforme :', error);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}).catch(error => {
  console.error('Erreur lors de la synchronisation de la base de données :', error);
});
