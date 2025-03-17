let ioInstance; // Variable pour stocker io

const articleSockets = require("../websockets/articleSockets");
const auctionSockets = require("../websockets/auctionSockets");
const notificationSockets = require("../websockets/notificationSockets");

module.exports = (io) => {
  ioInstance = io; // Stocker io dans une variable globale

  io.on("connection", (socket) => {
    console.log(`Nouvelle connexion WebSocket : ${socket.id}`);

    // Charger les événements WebSocket
    articleSockets(io, socket);
    auctionSockets(io, socket);
    notificationSockets(io, socket);

    socket.on("disconnect", () => {
      console.log(`Utilisateur déconnecté : ${socket.id}`);
    });
  });
};

// ✅ Exporter ioInstance pour qu'il soit accessible dans `articleController.js`
module.exports.getIO = () => {
  if (!ioInstance) {
    throw new Error("WebSocket `io` n'est pas encore initialisé !");
  }
  return ioInstance;
};
