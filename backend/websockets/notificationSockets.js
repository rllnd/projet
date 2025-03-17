module.exports = (io, socket) => {
    console.log("WebSocket pour les notifications chargé");
  
    socket.on("send-notification", (notification) => {
      io.emit("new-notification", notification);
    });
  };
  