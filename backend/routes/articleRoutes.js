// routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware'); // Importer `protect`
const Article = require('../models/Article');
const User = require('../models/User');

// Configuration de Multer pour gérer les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route pour créer un article avec une image principale et des images de galerie
router.post(
    '/create',
    protect,// Ce middleware doit être appelé avant l'action de création
    upload.fields([
      { name: 'imgFile', maxCount: 1 },
      { name: 'galleryFiles', maxCount: 5 },
    ]),
    articleController.createArticle
  );
  
router.get('/my-articles', protect, articleController.getSellerArticles);
// routes/articleRoutes.js
router.delete('/:articleId', protect, articleController.deleteArticle);
// Route pour modifier un article existant
router.put('/:id', protect, upload.fields([{ name: 'imgFile', maxCount: 1 }, { name: 'galleryFiles', maxCount: 5 }]), articleController.updateArticle);


router.get('/published', articleController.getPublishedArticles);

// Route pour mettre un article en enchère

// Route pour récupérer les articles célèbres
router.get('/famous', articleController.getFamousArticles);

// Route pour récupérer les enchères en cours
router.get('/auctions', articleController.getCurrentAuctions);

// Route pour récupérer les détails d'un article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller', // Assurez-vous que l'alias correspond à l'association
          attributes: ['id', 'name', 'email'], // Incluez les champs nécessaires
        },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    res.status(200).json(article);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



// Route pour incrémenter les vues d'un article
router.post('/:id/views', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }
    article.views += 1;
    await article.save();
    res.status(200).json({ message: "Vue incrémentée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour placer une enchère
router.post('/bids', async (req, res) => {
  const { articleId, bidAmount } = req.body;
  try {
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }
    if (bidAmount <= article.price) {
      return res.status(400).json({ message: "L'offre doit être supérieure au prix actuel." });
    }
    article.price = bidAmount;
    article.bids += 1; // Incrémente le nombre d'enchères
    await article.save();
    res.status(200).json({ message: "Enchère placée avec succès", newPrice: article.price });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});




module.exports = router;
