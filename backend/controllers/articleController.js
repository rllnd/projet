// articleController.js
const Article = require('../models/Article'); // Assurez-vous que ce chemin est correct
const { Op } = require('sequelize');
const User = require('../models/User');
const Category = require('../models/Category');
const normalizePath = (path) => path.replace(/\\/g, '/');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const sequelize = require('../config/db'); // Chemin vers votre configuration Sequelize
// Envoyer via WebSocket
const { getIO } = require('../config/socket'); 

exports.createArticle = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non autorisé ou non authentifié' });
    }

    const { name, categoryId, startPrice, shortDesc, fullDesc, endDate } = req.body;
    const sellerId = req.user.id;

    // Validation des champs
    if (!name || !categoryId || !startPrice || !endDate) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être renseignés.' });
    }

    if (!req.files || !req.files.imgFile || req.files.imgFile.length === 0) {
      return res.status(400).json({ message: 'L\'image principale est obligatoire.' });
    }

    if (req.files.galleryFiles && req.files.galleryFiles.length > 10) {
      return res.status(400).json({ message: 'La galerie ne peut contenir que 10 images maximum.' });
    }
    if (!req.files.galleryFiles || req.files.galleryFiles.length < 3) {
      return res.status(400).json({ message: 'La galerie doit contenir au moins 3 images.' });
    }

    // Vérification de la catégorie
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie invalide ou introuvable.' });
    }

    // Création de l'article
    const newArticle = await Article.create({
      name,
      categoryId,
      startPrice,
      price: startPrice,
      shortDesc,
      fullDesc,
      imgUrl: normalizePath(req.files.imgFile[0].path),
      endDate,
      gallery: req.files.galleryFiles.map((file) => normalizePath(file.path)),
      sellerId,
    });

    const io = getIO(); // Obtenir WebSocket instance
  
 // Charger l'article avec son vendeur AVANT d'envoyer via WebSocket
const articleWithSeller = await Article.findByPk(newArticle.id, {
  include: [{ model: User, as: 'seller', attributes: ['id', 'name'] }]
});

// 🔍 Vérifier si `seller` est bien inclus
// Vérification que le vendeur est bien inclus avant l'envoi
if (!articleWithSeller.seller) {
  console.warn("⚠️ Problème : article reçu sans vendeur. Tentative de correction...");
  const seller = await User.findByPk(articleWithSeller.sellerId, {
    attributes: ["id", "name"]
  });

  if (seller) {
    articleWithSeller.seller = seller; // Correction
    console.log("✅ Vendeur ajouté à l'article :", seller.name);
  } else {
    console.error("❌ Impossible de récupérer le vendeur !");
  }
}


io.emit("article-created", { message: "Article créé avec succès", article: articleWithSeller });




    res.status(201).json({ message: 'Article créé avec succès', article: newArticle });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'article.' });
  }
};


exports.getSellerArticles = async (req, res) => {
  try {
    let articles;

    if (req.user.isAdmin) {
      // Si l'utilisateur est un administrateur, renvoyer tous les articles
      articles = await Article.findAll({
        include: [
          {
            model: User,
            as: 'seller', // L'alias doit correspondre à celui défini dans les relations du modèle
            attributes: ['id', 'name'], // Sélectionnez uniquement les champs nécessaires
          },
         
        ],
        attributes: [
          'id',
          'name',
          'isApproved',
          'isAuctioned',
          'isPublished',
          'isRejected',
          'rejectReason',
          'price',
          'shortDesc',
          'createdAt',
        ],
        order: [['createdAt', 'DESC']], // Trier les articles par date de création
      });
    } else {
      // Sinon, renvoyer uniquement les articles du vendeur connecté
      const sellerId = req.user.id;
      articles = await Article.findAll({
        
        where: { sellerId },
        include: [
          {
            model: Category,
            as:'category',
            attributes: ['id', 'name'], // Inclure uniquement les champs nécessaires
          },
        ],// Filtrer par l'ID du vendeur
        attributes: [
          'id',
          'name',
          'isApproved',
          'isAuctioned',
          'isPublished',
          'isRejected',
          'rejectReason',
          'price',
          'shortDesc',
          'createdAt',
        ],
        order: [['createdAt', 'DESC']],
      });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// Fonction pour rejeter un article
exports.rejectArticle = async (req, res) => {
  try {
    const { articleId } = req.params; // Récupérer l'ID de l'article depuis les paramètres
    const { rejectReason } = req.body; // Récupérer la raison depuis le corps de la requête

    // Vérifier que la raison est fournie
    if (!rejectReason || rejectReason.trim() === '') {
      return res.status(400).json({ message: "La raison du rejet est obligatoire." });
    }

    // Trouver l'article
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé." });
    }

    // Vérifier si l'article est déjà approuvé ou publié
    if (article.isApproved) {
      return res.status(400).json({
        message: "Impossible de rejeter un article déjà approuvé.",
      });
    }

    // Mettre à jour l'article en tant que rejeté
    article.isRejected = true;
    article.rejectReason = rejectReason;
    await article.save();

    const io = getIO();
    io.emit("article-updated", {
      id: article.id,
      isRejected: true,
      rejectReason: rejectReason,
      isApproved: false,
      seller: article.seller
    });

    res.status(200).json({ message: "L'article a été rejeté avec succès.", article });
  } catch (error) {
    console.error("Erreur lors du rejet de l'article :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    await article.destroy();

    
const io = getIO(); 
    io.emit("article-deleted", articleId); // ✅ L’événement est bien émis ici

   
    res.status(200).json({ message: "Article supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article :", error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'article" });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    // Trouver l'article par son ID
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    // Vérifier si l'article est déjà en enchère
    if (article.isAuctioned) {
      return res.status(400).json({ message: "L'article est déjà mis en enchère et ne peut plus être modifié." });
    }

    // Récupérer les champs de la requête
    const { name, category, startPrice, shortDesc, fullDesc, endDate } = req.body;

    // Vérifier si de nouveaux fichiers d'image sont fournis
    const imgFile = req.files?.imgFile ? req.files.imgFile[0].path : article.imgUrl;
    const galleryFiles = req.files?.galleryFiles ? req.files.galleryFiles.map(file => file.path) : article.gallery;

    // Mettre à jour les champs de l'article
    article.name = name || article.name; // Garde l'ancienne valeur si aucune nouvelle valeur n'est donnée
    article.category = category || article.category;
    article.startPrice = startPrice || article.startPrice;
    article.price = startPrice || article.price;
    article.shortDesc = shortDesc || article.shortDesc;
    article.fullDesc = fullDesc || article.fullDesc;
    article.endDate = endDate || article.endDate;
    article.imgUrl = imgFile;
    article.gallery = galleryFiles;

   

     // ✅ Si l'article était approuvé, le remettre en "En attente" après modification
     if (article.isApproved) {
      article.isApproved = false; // Annuler l'approbation
      article.isRejected = false; // Remettre en attente
    }

    await article.save(); // Met à jour l'article dans la base


    const io = getIO();
    io.emit("article-updated", {
      id: article.id,
      name: article.name,
      category: article.category,
      startPrice: article.startPrice,
      shortDesc: article.shortDesc,
      fullDesc: article.fullDesc,
      endDate: article.endDate
    });

    res.status(200).json({ message: "Article mis à jour avec succès", article });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'article" });
  }
};


exports.getPendingArticles = async (req, res) => {
  try {
    const pendingArticles = await Article.findAll({ where: { isApproved: false } });
    res.json(pendingArticles);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles en attente :", error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des articles en attente' });
  }
};

// Approuver un article
exports.approveArticle = async (req, res) => {
  console.log('Params:', req.params); // Vérifiez si req.params contient bien `id`
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    article.isApproved = true;
    article.publishedAt = new Date();
    await article.save();

    const io = getIO(); // Récupérer WebSocket instance
    io.emit("article-updated", { 
      id: article.id, 
      isApproved: true,
      seller: article.seller 
    }); // Émettre l'événement

    res.json({ message: 'Article approuvé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'approbation de l\'article :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'approbation de l\'article' });
  }
};


exports.publishArticle = async (req, res) => {
  const { articleId } = req.params;

  try {
    const article = await Article.findByPk(articleId);

    if (!article) {
      console.log("Article non trouvé avec ID :", articleId);
      return res.status(404).json({ message: "Article non trouvé" });
    }

    if (!article.isApproved || !article.isAuctioned) {
      console.log(
        "Conditions non remplies : Approuvé ?",
        article.isApproved,
        ", En enchère ?",
        article.isAuctioned
      );
      return res.status(400).json({
        message: "L'article doit être approuvé et mis en enchère avant d'être publié",
      });
    }

    console.log("Avant mise à jour : isPublished =", article.isPublished);

    // Mettre à jour l'état de publication
    article.isPublished = true;

    // Enregistrer dans la base de données
    const updatedArticle = await article.save();
    console.log("Après mise à jour : isPublished =", updatedArticle.isPublished);

    res.status(200).json({
      message: "L'article a été publié avec succès",
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Erreur lors de la publication de l'article :", error);
    res.status(500).json({ message: "Erreur serveur lors de la publication de l'article" });
  }
};


exports.getPublishedArticles = async (req, res) => {
  try {
    const publishedArticles = await Article.findAll({
      where: { isPublished: true },
      include: [
        { 
          model: Category, 
          as: 'category', 
          attributes: ['name'] 
        },
        {
          model: Auction,
          as: 'auctionDetails',
          include: [
            {
              model: Bid,
              as: 'bids',
              attributes: [], // Ne pas inclure les détails des offres
            },
          ],
        },
      ],
      attributes: [
        'id',
        'name',
        'price',
        'shortDesc',
        'imgUrl',
        'createdAt',
        [sequelize.fn('COUNT', sequelize.col('auctionDetails.bids.id')), 'bidCount'], // Nombre total d'offres
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('auctionDetails.bids.userId'))), 'bidderCount'], // Nombre d'enchérisseurs uniques
      ],
      group: ['Article.id'], // Grouper par article
    });
    res.status(200).json(publishedArticles);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles publiés :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des articles publiés" });
  }
};
// Contrôleur pour les enchères en cours
exports.getCurrentAuctions = async (req, res) => {
  try {
    const auctions = await Article.findAll({
      where: {
        isAuctioned: true,
        endDate: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: Auction,
          as: 'auctionDetails',
          include: [
            {
              model: Bid,
              as: 'bids',
              attributes: [], // Ne pas inclure les détails des offres
            },
          ],
        },
      ],
      attributes: [
        'id',
        'name',
        'price',
        'shortDesc',
        'imgUrl',
        'endDate',
        [sequelize.fn('COUNT', sequelize.col('auctionDetails.bids.id')), 'bidCount'], 
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('auctionDetails.bids.userId'))), 'bidderCount'],
      ],
      group: ['Article.id'],
     
    });
    
    res.status(200).json(auctions);
  } catch (error) {
    console.error("Erreur lors de la récupération des enchères en cours :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Contrôleur pour les articles célèbres
exports.getFamousArticles = async (req, res) => {
  try {
    const famousArticles = await Article.findAll({
      where: {
        [Op.or]: [
          { views: { [Op.gt]: 3 } }, // Articles avec plus de 50 vues
          { bids: { [Op.gt]: 2 } },  // Articles avec plus de 10 enchères
        ],
      },
      include: [
        {
          model: Category,
          as:'category',
          attributes: ['id', 'name'], // Inclure uniquement les champs nécessaires
        },
      ],
      order: [
        ['views', 'DESC'], // Trier par vues décroissantes
        ['bids', 'DESC'],  // Puis par enchères décroissantes
      ],
      limit: 10, // Limite à 10 articles célèbres
    });

    res.status(200).json(famousArticles);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles célèbres :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id, {
      include: [
        {
          model: Auction,
          as: 'auctionDetails',
          required: true, // Ajoutez ceci pour forcer une correspondance
          attributes: ['id', 'currentHighestBid', 'maxAutoBid', 'status', 'endDate'],
        },

        {
          model: User,
          as: 'seller', // Inclure également le vendeur
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

      console.log("Article récupéré :", JSON.stringify(article, null, 2));
    // Normaliser les chemins d'image dans la galerie
    if (Array.isArray(article.gallery)) {
      article.gallery = article.gallery.map((path) => path.replace(/\\/g, '/'));
    }

    res.status(200).json(article);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article :", error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

const _ = require('lodash');

exports.getFollowedAuctions = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const userId = req.user.id;
    const userRole = req.user.role; // 🔥 Récupérer le rôle de l'utilisateur

    // Si c'est un vendeur, il n'a pas d'enchères suivies
    if (userRole === 'seller') {
      return res.status(200).json({ followedAuctions: [], userRole });
    }

    const followedAuctions = await Bid.findAll({
      where: { userId },
      include: [
        {
          model: Auction,
          as: 'auction',
          required: true,
          include: [
            {
              model: Article,
              as: 'articleDetails',
              required: true,
              attributes: ['id', 'name', 'shortDesc', 'price', 'endDate', 'imgUrl',],
            },
            
          ],
        },
        {
          model: User,
          as: 'bidder',
          required: true,
          attributes: ['id', 'name', ],
        },
      ],
      order: [['createdAt', 'DESC']],
      nest: true,
    });

    // 🔥 Filtrer pour garder un seul article par ID
    const uniqueArticles = _.uniqBy(followedAuctions.map(bid => bid.auction.articleDetails), 'id');

    res.status(200).json({ followedAuctions: uniqueArticles, userRole });
  } catch (error) {
    console.error("Erreur lors de la récupération des enchères suivies :", error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des enchères suivies.' });
  }
};








