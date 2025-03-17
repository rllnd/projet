const cron = require('node-cron');
const { stopInactiveAuctions, closeExpiredAuctions } = require('../controllers/auctionController');

// Planification pour arrêter les enchères inactives et clôturer les enchères expirées toutes les 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Exécution de la vérification des enchères inactives et expirées...');
  try {
    await stopInactiveAuctions(); // Arrête automatiquement les enchères inactives
    await closeExpiredAuctions(); // Clôture les enchères expirées
    console.log('Vérification des enchères terminée avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des tâches planifiées :', error);
  }
});

console.log('Scheduler configuré et prêt à exécuter les tâches.');
