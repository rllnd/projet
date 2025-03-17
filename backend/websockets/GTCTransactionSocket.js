const { getIO } = require("./websocket");

const initGTCTransactionSocket = () => {
  const io = getIO();

  io.on("connection", (socket) => {
    console.log("📡 Client connecté au GTCTransactionSocket :", socket.id);

    // Gestion de la déconnexion
    socket.on("disconnect", () => {
      console.log("❌ Client déconnecté du GTCTransactionSocket :", socket.id);
    });
  });
};

// Fonction pour émettre une mise à jour de transaction en temps réel
const emitTransactionUpdate = (transactionData) => {
  const io = getIO();
  io.emit("transaction-update", transactionData);
  console.log("📡 Émission d'une nouvelle transaction en temps réel :", transactionData);
};

module.exports = { initGTCTransactionSocket, emitTransactionUpdate };
