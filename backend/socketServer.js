const { Server } = require('socket.io');

// Fonction pour configurer et gérer Socket.io
function setupSocketServer(httpServer) {
  const io = new Server(httpServer);

  // Stocker l'instance de io pour pouvoir l'utiliser ailleurs
  global.io = io;  // Vous pouvez aussi passer 'io' comme export si nécessaire

  io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Lorsqu'une enchère est mise à jour, envoyez les nouvelles informations à tous les clients connectés
    socket.on('newBid', (auctionId, currentHighestBid) => {
      io.emit('auctionUpdate', { auctionId, currentHighestBid });
    });

    socket.on('disconnect', () => {
      console.log('Un utilisateur a été déconnecté');
    });
  });
}

module.exports = setupSocketServer;
