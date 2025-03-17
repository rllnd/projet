const Platform = require('../models/Platform'); // Import du modèle Platform

// Contrôleur pour récupérer le solde de la plateforme
exports.getPlatformBalance = async (req, res) => {
  try {
    const platform = await Platform.findOne({
      attributes: ['id', 'balance', 'minPurchaseLimit', 'maxPurchaseLimit', 'createdAt', 'updatedAt'],
    });
    
    if (!platform) {
      return res.status(404).json({ message: 'Plateforme introuvable.' });
    }
    res.status(200).json({ platformBalance: platform.balance });
  } catch (error) {
    console.error('Erreur lors de la récupération du solde de la plateforme :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Contrôleur pour mettre à jour le solde de la plateforme lors d'une vente
exports.updatePlatformBalance = async (req, res) => {
  const { amount } = req.body; // Récupère le montant à ajouter depuis la requête

  // Vérifie que le montant est valide
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Le montant doit être un nombre positif.', // Validation des entrées
    });
  }

  try {
    // Récupère la plateforme (unique enregistrement attendu)
    const platform = await Platform.findOne();

    // Si la plateforme n'existe pas, retourne une erreur
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Plateforme introuvable.', // Retourne une erreur si la plateforme n'existe pas
      });
    }

    // Met à jour le solde de la plateforme
    platform.balance += amount; // Ajoute le montant reçu au solde existant
    await platform.save(); // Sauvegarde les modifications dans la base de données

    console.log(`Solde de la plateforme mis à jour : ${platform.balance}`); // Log pour déboguer

    // Retourne la réponse avec le nouveau solde
    return res.status(200).json({
      success: true,
      message: 'Le solde de la plateforme a été mis à jour avec succès.',
      platformBalance: platform.balance, // Nouveau solde de la plateforme
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du solde de la plateforme :', error);
    // Gestion des erreurs internes du serveur
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};

// Contrôleur pour réinitialiser le solde de la plateforme (si nécessaire)
exports.resetPlatformBalance = async (req, res) => {
  const { balance } = req.body; // Récupère le nouveau solde depuis la requête

  // Vérifie si le nouveau solde est valide
  if (typeof balance !== 'number' || balance < 0) {
    return res.status(400).json({
      success: false,
      message: 'Le solde doit être un nombre positif.', // Retourne une erreur si le solde est invalide
    });
  }

  try {
    // Récupère la plateforme
    const platform = await Platform.findOne();

    // Si la plateforme n'existe pas, retourne une erreur
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Plateforme introuvable.', // Erreur si aucun enregistrement trouvé
      });
    }

    // Réinitialise le solde de la plateforme avec la valeur fournie
    platform.balance = balance;
    await platform.save(); // Sauvegarde les modifications dans la base de données

    console.log(`Solde de la plateforme réinitialisé à : ${platform.balance}`); // Log pour déboguer

    // Retourne une réponse avec le nouveau solde
    return res.status(200).json({
      success: true,
      message: 'Le solde de la plateforme a été réinitialisé avec succès.',
      platformBalance: platform.balance, // Nouveau solde de la plateforme
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du solde de la plateforme :', error);
    // Gestion des erreurs internes du serveur
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};

exports.updatePurchaseLimits = async (req, res) => {
  try {
    const { minPurchaseLimit, maxPurchaseLimit } = req.body;

    // Validation des données entrantes
    if (
      (minPurchaseLimit !== undefined && (typeof minPurchaseLimit !== 'number' || minPurchaseLimit < 0)) ||
      (maxPurchaseLimit !== undefined && (typeof maxPurchaseLimit !== 'number' || maxPurchaseLimit < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Les limites doivent être des nombres positifs.",
      });
    }

    // Récupérer la plateforme (unique enregistrement attendu)
    const platform = await Platform.findOne();
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Plateforme introuvable.",
      });
    }

    // Mise à jour des limites
    if (minPurchaseLimit !== undefined) {
      platform.minPurchaseLimit = minPurchaseLimit;
    }
    if (maxPurchaseLimit !== undefined) {
      platform.maxPurchaseLimit = maxPurchaseLimit;
    }

    await platform.save(); // Sauvegarder les modifications dans la base de données

    return res.status(200).json({
      success: true,
      message: "Les limites ont été mises à jour avec succès.",
      platform, // Retourner l'état actuel de la plateforme
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des limites :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur.",
    });
  }
};

// Contrôleur pour mettre à jour les limites de vente
exports.updateSaleLimits = async (req, res) => {
  try {
    const { minSaleLimit, maxSaleLimit } = req.body;

    if (
      (minSaleLimit !== undefined && (typeof minSaleLimit !== 'number' || minSaleLimit < 0)) ||
      (maxSaleLimit !== undefined && (typeof maxSaleLimit !== 'number' || maxSaleLimit < 0))
    ) {
      return res.status(400).json({ success: false, message: "Les limites de vente doivent être des nombres positifs." });
    }

    const platform = await Platform.findOne();
    if (!platform) {
      return res.status(404).json({ success: false, message: "Plateforme introuvable." });
    }

    if (minSaleLimit !== undefined) platform.minSaleLimit = minSaleLimit;
    if (maxSaleLimit !== undefined) platform.maxSaleLimit = maxSaleLimit;

    await platform.save();

    res.status(200).json({ success: true, message: "Limites de vente mises à jour avec succès.", platform });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des limites de vente :", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

// Contrôleur pour récupérer toutes les limites
exports.getLimits = async (req, res) => {
  try {
    const platform = await Platform.findOne();

    if (!platform) {
      return res.status(404).json({ success: false, message: "Plateforme introuvable." });
    }

    res.status(200).json({
      success: true,
      purchaseLimits: {
        min: platform.minPurchaseLimit,
        max: platform.maxPurchaseLimit,
      },
      saleLimits: {
        min: platform.minSaleLimit,
        max: platform.maxSaleLimit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des limites :", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur." });
  }
};

exports.getPlatformDetails = async (req, res) => {
  try {
    const platform = await Platform.findOne();
    if (!platform) {
      return res.status(404).json({ message: 'Plateforme introuvable.' });
    }
    res.status(200).json({
      balance: platform.balance,
      minPurchaseLimit: platform.minPurchaseLimit,
      maxPurchaseLimit: platform.maxPurchaseLimit,
      minSaleLimit: platform.minSaleLimit,
      maxSaleLimit: platform.maxSaleLimit,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la plateforme :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getAuctionFee = async (req, res) => {
  try {
    const platform = await Platform.findOne();
    
    if (!platform) {
      return res.status(404).json({ message: "Les paramètres de la plateforme n'ont pas été trouvés." });
    }

    res.status(200).json({ auctionFee: platform.auctionFee });
  } catch (error) {
    console.error("Erreur lors de la récupération des frais d'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

/**
 * Mettre à jour les frais d'enchère (réservé à l'administrateur)
 */
exports.updateAuctionFee = async (req, res) => {
  try {
    const { auctionFee } = req.body;

    // Vérifier que la valeur est valide
    if (!auctionFee || auctionFee < 1) {
      return res.status(400).json({ message: "Les frais d'enchère doivent être d'au moins 1 GTC." });
    }

    let platform = await Platform.findOne();
    if (!platform) {
      platform = await Platform.create({ balance: 0, auctionFee });
    } else {
      platform.auctionFee = auctionFee;
      await platform.save();
    }

    res.status(200).json({ message: "Frais d'enchère mis à jour avec succès.", auctionFee });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des frais d'enchère :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

