const AuditLog = require('../models/AuditLog');
const Admin = require("../models/Admin");
const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable").default; // 🔥 Utilisation de .default


// 🔹 1. Récupérer tous les logs d’audit


exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      attributes: ['id', 'adminId', 'action', 'details', 'createdAt'],
      include: [
        {
          model: Admin,
          as:'admin', // 🔥 Assurez-vous que le modèle Admin est bien importé
          attributes: ['name'],  // 🔥 On récupère le nom de l'admin
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    // 🔹 Formater les logs pour inclure le nom de l'admin
    const logsWithDetails = logs.map(log => ({
      id: log.id,
      adminName: log.admin ? log.admin.name : "Inconnu", // 🔥 Si pas d'admin, afficher "Inconnu"
      action: log.action,
      details: log.details ? log.details : "Aucun détail",
      createdAt: log.createdAt
    }));
  

    res.status(200).json({ success: true, data: logsWithDetails });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des logs :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};




// 🔹 2. Enregistrer un audit log manuellement (exemple)
exports.createAuditLog = async (req, res) => {
  try {
    const { adminId, action, details } = req.body;

    const log = await AuditLog.create({
      adminId,
      action,
      details: JSON.stringify(details)
    });

    res.status(201).json({ success: true, message: "Audit log enregistré", log });
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement du log :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🔹 3. Générer un rapport PDF des logs d’audit

const actionDescriptions = {
  "POST /api/admins": "Ajout d'un administrateur",
  "DELETE /api/admins/:id": "Suppression d'un administrateur",
  "PUT /api/admins/:id": "Mise à jour d'un administrateur",

  "DELETE /api/users/:id": "Suppression d'un utilisateur",

  "PUT /api/articles/:id/publish": "Publication d'un article",
  "PUT /api/articles/:id/approve": "Approbation d'un article",
  "PUT /api/articles/:id/reject": "Rejet d'un article",

  "PUT /api/auctions/stop/:id": "Arrêt manuel d'une enchère",
  "PUT /api/auctions/cancel/:id": "Annulation d'une enchère",

  "DELETE /api/messages/:id": "Suppression d'un message",

  "POST /api/create": "Ajout d'une catégorie",
  "PUT /api/categories/:id": "Mise à jour d'une catégorie",
  "DELETE /api/categories/:id": "Suppression d'une catégorie",

  "PUT /api/platform/update-sale-limits": "Mise à jour de vente de Token",
  "PUT /api/platform/update-purchase-limits": "Mise à jour d'achat de Token",

  "DELETE /api/superadmin/users/:id":"Suppression d'un utilisateur",

  "PUT /api/conversion-rate/update":"Mise à jour de Taux de Conversion", 
  "PUT /api/superadmin/auctions/cancel/:id": "Annulation d'une enchère", 

  "POST /api/faqs": "Ajout d'une FAQ",
  "PUT /api/faqs/:id": "Mise à jour d'une FAQ",
  "DELETE /api/faqs/:id": "Suppression d'une FAQ",

  "PUT /api/conversion/update": "Mise à jour du taux de conversion",
};

const getActionDescription = (action) => {
  for (const key in actionDescriptions) {
    const regex = new RegExp(`^${key.replace(/:\w+/g, "\\d+")}$`);
    if (regex.test(action) || action.startsWith(key.replace(/:\w+/g, ""))) {
      return actionDescriptions[key] || action;
    }
  }
  return action; // Retourne l'action brute si pas de correspondance
};

exports.generateAuditReport = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Admin, as: 'admin', attributes: ['name'] }],
    });

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("📋 Rapport des Activités Administratives", 10, 10);

    // Structurer les données
    const tableData = logs.map(log => [
      log.id,
      log.admin ? log.admin.name : "Inconnu",
      getActionDescription(log.action),
      log.details ? (typeof log.details === "string" ? log.details.replace(/[{|}"]/g, '') : log.details) : "Aucun détail",
      new Date(log.createdAt).toLocaleString()
    ]);

    // Ajout de la table avec style amélioré
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Administrateur", "Action", "Détails", "Date"]],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [230, 240, 250] },
    });

    const fileName = "rapport_audit.pdf";
    doc.save(fileName);

    res.download(fileName);
  } catch (error) {
    console.error("❌ Erreur lors de la génération du rapport d’audit :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


