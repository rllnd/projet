const { Op } = require("sequelize");
const Auction = require('../models/Auction');
const User = require('../models/User');
const Bid = require('../models/Bid');

module.exports = (io, socket) => {
    console.log("✅ WebSocket pour les enchères chargé");

    // 🔹 Écoute une nouvelle enchère et diffuse en temps réel
    socket.on("new-bid", async (bidData) => {
        console.log("🔼 Nouvelle enchère reçue :", bidData);

        try {
            const { auctionId, bidAmount, userId } = bidData;
            const auction = await Auction.findByPk(auctionId);

            if (!auction || auction.status !== 'open') {
                return socket.emit("bid-error", { message: "❌ Enchère non disponible." });
            }

            if (bidAmount <= auction.currentHighestBid) {
                return socket.emit("bid-error", { message: "❌ Le montant doit être supérieur à l'offre actuelle." });
            }

            // Créer une nouvelle enchère
            const bid = await Bid.create({
                auctionId,
                userId,
                amount: bidAmount,
                bidTime: new Date(),
            });

            // Mettre à jour l'enchère
            auction.currentHighestBid = bidAmount;
            auction.highestBidUserId = userId;
            await auction.save();

            // Récupérer les détails du plus haut enchérisseur
            const highestBidder = await User.findByPk(userId, { attributes: ['id', 'name', 'email'] });

            // 🔥 WebSocket - Diffuser la mise à jour à tous les clients
            io.emit("bid-updated", {
                auctionId: auction.id,
                currentHighestBid: auction.currentHighestBid,
                highestBidder: highestBidder ? { id: highestBidder.id, name: highestBidder.name, email: highestBidder.email } : null,
            });

            console.log(`🔥 Enchère mise à jour en temps réel pour l'article ${auctionId}`);
        } catch (error) {
            console.error("❌ Erreur lors de la mise à jour de l'enchère :", error);
            socket.emit("bid-error", { message: "❌ Erreur serveur." });
        }
    });

    // 🔹 Écoute les enchères terminées et informe en temps réel
    const checkAuctionsExpiration = async () => {
        try {
            const now = new Date();
            const expiredAuctions = await Auction.findAll({
                where: {
                    status: 'open',
                    endDate: { [Op.lte]: now }
                }
            });

            if (expiredAuctions.length > 0) {
                for (const auction of expiredAuctions) {
                    auction.status = 'closed';
                    await auction.save();

                    // 🔥 Diffuser l'arrêt automatique à tous les utilisateurs connectés
                    io.emit("auction-ended", {
                      id: auction.id,
                      winner: auction.highestBidder ? {
                          id: auction.highestBidder.id,
                          name: auction.highestBidder.name,
                          email: auction.highestBidder.email
                      } : null,
                      finalPrice: auction.currentHighestBid
              });
              console.log(`🔴 Enchère terminée en temps réel : ${auction.id}, Gagnant: ${auction.highestBidUserId}`);
                }
            }
        } catch (error) {
            console.error("❌ Erreur lors de la vérification des enchères expirées :", error);
        }
    };

    setInterval(checkAuctionsExpiration, 10000);

    // ✅ Écoute l'annulation d'une enchère
    socket.on("auction-cancelled", async (data) => {
        console.log("🚫 Enchère annulée :", data.id);
        io.emit("auction-cancelled", { id: data.id });
    });

    // ✅ Écoute l'arrêt d'une enchère
    socket.on("auction-stopped", async (data) => {
        console.log("🛑 Enchère stoppée :", data.id);
        io.emit("auction-stopped", { id: data.id });
    });

     // ✅ Écoute l'arrêt d'une enchère
     socket.on("auction-ended", async (data) => {
      console.log("🛑 Enchère stoppée :", data.id);
      io.emit("auction-ended", { id: data.id });
  });
};
