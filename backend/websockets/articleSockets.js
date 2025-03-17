module.exports = (io, socket) => {
    console.log("WebSocket pour les articles chargé");
  
    socket.on("update-article", (updatedArticle) => {
      io.emit("article-updated", updatedArticle);
    });
  
    socket.on("delete-article", (articleId) => {
      console.log("🗑️ Suppression d'un article reçue :", articleId);
   
      io.emit("article-deleted", articleId);
    });
  
    socket.on("create-article", (newArticle) => {
      console.log("🟢 Nouvel article créé reçu sur WebSocket :", newArticle);
    
      io.emit("article-created", newArticle);
    });
  };
  