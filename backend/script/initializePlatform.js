const Platform = require('../models/Platform'); // Chemin vers votre modèle Platform

const initializePlatform = async () => {
  try {
    const platformExists = await Platform.findOne();
    if (!platformExists) {
      const platform = await Platform.create({
        balance: 1000000000, // Solde initial
      });
      console.log('Plateforme initialisée avec le solde :', platform.balance);
    } else {
      console.log('La plateforme existe déjà avec un solde de :', platformExists.balance);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la plateforme :', error);
  }
};

module.exports = initializePlatform;
