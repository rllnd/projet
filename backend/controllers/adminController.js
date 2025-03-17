const Admin = require('../models/Admin'); // Assurez-vous que le chemin est correct
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Transaction = require('../models/GTCTransaction');
const Auction = require('../models/Auction');
const Article = require('../models/Article');
const ConversionRate = require('../models/ConversionRate');
const Notification = require('../models/Notifications');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id_admin', 'name', 'email', 'role', 'isActive'],
    });
    res.status(200).json(admins);
  } catch (error) {
    console.error('Erreur lors de la récupération des administrateurs :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
  }

  try {
    // Vérifier si l'email est déjà utilisé
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'administrateur
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'superadmin', // Par défaut, superadmin
    });

    res.status(201).json({ message: 'Administrateur créé avec succès.', admin });
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByPk(id);

    if (!admin) {
      return res.status(404).json({ message: 'Administrateur non trouvé.' });
    }

    // Supprimer l'administrateur
    await admin.destroy();

    res.status(200).json({ message: 'Administrateur supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'administrateur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


exports.getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.count( { where: { isApproved : true}});
    

    const totalTransactions = await Transaction.count();
    

    const totalAuctions = await Auction.count();
    

    const activeAuctions = await Auction.count({ where: { status: 'open' } });
    

    const completedAuctions = await Auction.count({ where: { status: 'completed' } });
    

    const cancelledAuctions = await Auction.count({ where: { status: 'cancelled' } });
    

    const platformRevenue = await Transaction.sum('amount', {
      where: { type: { [Op.in]: ['reward', 'fee'] } }
    }) || 0;
    

    const pendingNotifications = await Notification.count({ where: { isRead: false } });

    // Compter les articles en attente d'approbation
    const pendingArticles = await Article.count({ where: { isApproved : false, isRejected : false} });

     // Compter les articles rejetés
     const rejectedArticles = await Article.count({ where: { isRejected: true } });

     // Compter les articles rejetés
  const conversionRateEntry = await ConversionRate.findOne({
      where: {
        fromCurrency: 'GTC',
        toCurrency: 'MGA',
      },
       order: [['createdAt', 'DESC']], 
    });
    
    
  const conversionRate = conversionRateEntry.rate; // Récupérer le taux
    

  const balanceInAriary = (platformRevenue* conversionRate).toFixed(2); // Calculer le solde en Ariary


    

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        totalAuctions,
        activeAuctions,
        completedAuctions,
        cancelledAuctions,
        platformRevenue,
        pendingNotifications,
        pendingArticles,
        rejectedArticles,
        balanceInAriary,
        conversionRateEntry,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'overview admin :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques.",
    });
  }
};




