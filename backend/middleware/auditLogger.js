const AuditLog = require('../models/AuditLog');
const Article = require('../models/Article'); // Importer le modèle d'articles

const auditLogger = async (req, res, next) => {
  try {
    const adminId = req.user && req.user.isAdmin ? req.user.id_admin : null;
    const action = `${req.method} ${req.originalUrl}`;
    let details = {};

   

    if (req.method === "PUT" && req.originalUrl.includes("/api/articles/approve")) {
      const articleId = req.params.id;
      const article = await Article.findByPk(articleId, { attributes: ['id', 'name'] });
      if (article) {
        details = { id: article.id, name: article.name };
      } else {
        details = { id: articleId, info: "Article non trouvé pour approbation" };
      }
    }

    // Ajoutez d'autres cas selon les besoins...

    // Si aucune information spécifique n'est trouvée, inclure les détails du corps de la requête
    if (Object.keys(details).length === 0 && Object.keys(req.body).length > 0) {
      details = req.body;
    }

    const formattedDetails = JSON.stringify(Object.keys(details).length > 0 ? details : { info: "Aucune information spécifique enregistrée" });

    if (adminId) {
      await AuditLog.create({ adminId, action, details: formattedDetails });
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement de l'audit :", error);
  }
  next();
};
module.exports = auditLogger;


