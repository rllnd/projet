// articleController.js
const Article = require('../models/Article'); // Assurez-vous que ce chemin est correct
const { Op } = require('sequelize');
const User = require('../models/User');

const normalizePath = (path) => path.replace(/\\/g, '/');
exports.createArticle = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'Utilisateur non autorisé ou non authentifié' });
    }

    const { name, category, price, shortDesc, fullDesc, endDate } = req.body;
    const sellerId = req.user.id;

    const newArticle = await Article.create({
      name,
      category,
      price,
      shortDesc,
      fullDesc,
      imgUrl: req.files?.imgFile ? req.files.imgFile[0].path : null,
      endDate,
      gallery: req.files?.galleryFiles ? req.files.galleryFiles.map(file => file.path) : [],
      sellerId,
    });

    res.status(201).json({ message: 'Article créé avec succès', article: newArticle });
  } catch (error) {
    console.error("Erreur lors de la création de l'article :", error);
    res.status(500).json({ message: "Erreur lors de la création de l'article" });
  }
};

exports.getSellerArticles = async (req, res) => {
  try {
    let articles;

    if (req.user.isAdmin) {
      // Si l'utilisateur est un administrateur, renvoyer tous les articles
      articles = await Article.findAll({
        order: [['createdAt', 'DESC']], // Trier les articles par date de création
      });
    } else {
      // Sinon, renvoyer uniquement les articles du vendeur connecté
      const sellerId = req.user.id;
      articles = await Article.findAll({
        where: { sellerId }, // Filtrer par l'ID du vendeur
        order: [['createdAt', 'DESC']],
      });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error('Erreur lors de la récupération des articles :', error);
    res.status(500).json({ message: 'Erreur serveur' });
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
    const { name, category, price, shortDesc, fullDesc, endDate } = req.body;

    // Vérifier si de nouveaux fichiers d'image sont fournis
    const imgFile = req.files?.imgFile ? req.files.imgFile[0].path : article.imgUrl;
    const galleryFiles = req.files?.galleryFiles ? req.files.galleryFiles.map(file => file.path) : article.gallery;

    // Mettre à jour les champs de l'article
    article.name = name || article.name; // Garde l'ancienne valeur si aucune nouvelle valeur n'est donnée
    article.category = category || article.category;
    article.price = price || article.price;
    article.shortDesc = shortDesc || article.shortDesc;
    article.fullDesc = fullDesc || article.fullDesc;
    article.endDate = endDate || article.endDate;
    article.imgUrl = imgFile;
    article.gallery = galleryFiles;

    // Sauvegarder les changements dans la base de données
    await article.save();
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
  const { articleId } = req.params;

  try {
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    article.isApproved = true;
    article.publishedAt = new Date(); // Définit la date de publication lors de l'approbation
    await article.save();

    res.json({ message: 'Article approuvé avec succès' });
  } catch (error) {
    console.error("Erreur lors de l'approbation de l'article :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'approbation de l'article" });
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
    const publishedArticles = await Article.findAll({ where: { isPublished: true } });
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
        endDate: { [Op.gt]: new Date() }, // Enchères qui ne sont pas encore terminées
      },
      order: [
        ['endDate', 'ASC'], // Trier par date de fin la plus proche
      ],
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
          { views: { [Op.gt]: 1 } }, // Articles avec plus de 50 vues
          { bids: { [Op.gt]: 1 } },  // Articles avec plus de 10 enchères
        ],
      },
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




