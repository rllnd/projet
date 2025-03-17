const { Queue, Worker, QueueScheduler, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
const sequelize = require('../config/db'); // Connexion à la base de données
const { getIO } = require("../config/socket"); // WebSocket pour mises à jour en temps réel
const BidController = require('../controllers/BidController');
const Bid = require("../models/Bid");
const Auction = require("../models/Auction");
const Article = require("../models/Article");
const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ✅ Créer la file d'attente des enchères
const bidQueue = new Queue('bidQueue', { connection });
const bidQueueEvents = new QueueEvents('bidQueue', { connection });

// ✅ Écouter les événements de la queue
bidQueueEvents.on('completed', (job) => {
  console.log(`✅ Job terminé : ${job.jobId}`);
});

bidQueueEvents.on('failed', (job, err) => {
  console.error(`❌ Job échoué : ${job.jobId}`, err);
});

// ✅ Worker pour traiter les enchères
const bidWorker = new Worker(
  'bidQueue',
  async (job) => {
    try {
      console.log(`📌 Job reçu: Nom = ${job.name}, ID = ${job.id}, Données:`, job.data);

      // ✅ Vérifier si `auctionId`, `userId`, `bidAmount` sont bien présents
      if (!job.data.auctionId || !job.data.userId || (job.name === 'manual-bid' && !job.data.bidAmount)) {
        console.error(`❌ Données invalides reçues pour job ID=${job.id}:`, job.data);
        throw new Error("❌ Données invalides: Auction ID, User ID ou montant d'enchère manquant !");
      }

      const { auctionId, bidAmount, userId, maxBidAmount } = job.data;

      console.log(`🔍 Traitement du job ID=${job.id} pour Auction ID=${auctionId}, User ID=${userId}`);

      // ✅ Gestion avec transaction
      const t = await sequelize.transaction();
      try {
        let result;

        if (job.name === 'manual-bid') {
          result = await BidController.processBid({ auctionId, bidAmount, userId, isAutoBid: false, transaction: t });
        } else if (job.name === 'auto-bid') {
          result = await BidController.processAutoBid({ auctionId, maxBidAmount, userId, transaction: t });
        }

        await t.commit(); // ✅ Confirmer la transaction
        console.log(`✅ Job ${job.name} (ID: ${job.id}) exécuté avec succès.`);

      } catch (error) {
        await t.rollback(); // ❌ Annuler la transaction
        console.error(`❌ Erreur dans la transaction pour job ${job.id}:`, error);
        throw error;
      }

    } catch (error) {
      console.error(`❌ Erreur lors du traitement du job ${job.name} ID=${job.id}:`, error);
      throw error;
    }
  },
  { 
    connection,
    concurrency: 10 // 🔥 Permet de traiter plusieurs enchères en parallèle
  }
);


// ✅ Gérer les erreurs du Worker
bidWorker.on('failed', (job, err) => {
  console.error(`❌ Erreur lors du traitement du job ${job.name}:`, err);
});

module.exports = { bidQueue, bidQueueEvents };
