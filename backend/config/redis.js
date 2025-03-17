const IORedis = require("ioredis");

const redisConnection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // 🔥 Évite l'erreur BullMQ
  enableReadyCheck: false, // 🔥 Évite les problèmes de connexion
});

redisConnection.on("error", (err) => {
  console.error("❌ Erreur Redis :", err);
});

redisConnection.on("connect", () => {
  console.log("✅ Connexion Redis établie !");
});

module.exports = redisConnection;
