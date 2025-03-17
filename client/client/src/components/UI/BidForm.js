import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import '../../styles/BidForm.css';
import { Input, Button } from 'antd';
import { useSocket } from '../../contexts/SocketContext'; // Import WebSocket

const BidForm = ({ articleId, currentBid, setCurrentBid, bids, setBids, userTokens, refreshArticle }) => {
  const [manualBid, setManualBid] = useState('');
  const [autoBid, setAutoBid] = useState('');
  const socket = useSocket(); // Récupérer l'instance WebSocket

  const handleManualBidSubmit = async () => {
    
    if (!articleId) {
      message.error("Erreur : Article ID introuvable !");
      return;
    }

    if (!manualBid || parseFloat(manualBid) <= currentBid) {
      message.warning("Votre enchère doit être supérieure au prix actuel.");
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole'); // Récupérer le rôle de l'utilisateur

      if (!token) {
        message.error(" Vous devez vous connecter pour placer une enchère !");
        return;
      }
      if (userRole === "seller") { 
        message.error("❌ Les vendeurs ne peuvent pas enchérir sur les articles !");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/bids/manual`,
        { articleId, bidAmount: parseFloat(manualBid) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Réponse du serveur :", response.data);

      if (!response.data.auction) {
        console.error("❌ Erreur: La réponse ne contient pas d'objet 'auction'.", response.data);
        message.error("Erreur: La mise n'a pas été enregistrée correctement.");
        return;
      }

      //✅ Émettre un événement pour mettre à jour immédiatement
      socket.emit("bid-updated", {
        auctionId: response.data.auction.id,
        currentHighestBid: response.data.auction.currentHighestBid,
        highestBidderId: response.data.auction.highestBidUserId,
        highestBidderName: response.data.auction.highestBidderName || "Utilisateur inconnu",
      });

    console.log("🔼 WebSocket bid-updated envoyé :", {
      auctionId: response.data.auction.id,
      currentHighestBid: response.data.auction.currentHighestBid,
      highestBidderId: response.data.auction.highestBidUserId,
    });
    

      setCurrentBid(response.data.auction.currentHighestBid);
      setBids([...bids, response.data.bid]);
      message.success('Enchère placée avec succès.');
      refreshArticle(); // Mise à jour après enchère
    } catch (error) {
      console.error("Erreur lors de l'enchère manuelle :", error.response?.data || error);
      message.error(error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  const handleAutoBidSubmit = async () => {
    
    

    const maxBidAmount = parseFloat(autoBid);
  if (!maxBidAmount || isNaN(maxBidAmount) || maxBidAmount <= currentBid) {
    message.warning("Le montant maximal doit être un nombre valide et supérieur au prix actuel.");
    return;
  }

    try {
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole'); // Récupérer le rôle de l'utilisateur

      if (!token) {
        message.error(" Vous devez vous connecter pour activer une enchère automatique !");
        return;
      }

      if (userRole === "seller") { 
        message.error("❌ Les vendeurs ne peuvent pas enchérir sur les articles !");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/bids/auto`,
        { articleId, maxBidAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      

      console.log("Enchère automatique activée :", response.data);
      message.success("Enchère automatique activée avec succès !");
      setAutoBid('');
      refreshArticle(); // Mise à jour de l'article après enchère
    } catch (error) {
      console.error("Erreur lors de l'enchère automatique :", error.response?.data || error);
      message.error(error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  useEffect(() => {
  if (!socket) return;

  socket.on("auto-bid-placed", (updatedAuction) => {
    console.log("⚡ WebSocket auto-bid-placed reçu :", updatedAuction);

    if (!updatedAuction.highestBidderId) {
      console.error("❌ Erreur: `highestBidderId` est undefined dans auto-bid-placed !");
      return;
    }

    setCurrentBid(updatedAuction.currentHighestBid);

    setBids((prevBids) => [
      ...prevBids,
      {
        userId: updatedAuction.highestBidderId,
        amount: updatedAuction.currentHighestBid,
        bidTime: new Date(),
      }
    ]);

    message.info(`Nouvelle enchère automatique placée par ${updatedAuction.highestBidderName || 'un utilisateur'}`);
  });

  return () => {
    socket.off("auto-bid-placed");
  };
}, [socket, articleId]);

  

  return (
    <div className="bid-form">
      <h3 >Placer une enchère</h3>
      <div className="bid-options">
        <div className="bid-option">
          <input
            type="number"
            placeholder="Montant de l'enchère"
            value={manualBid}
            onChange={(e) => setManualBid(e.target.value)}
            className="bid-input"
          />
          <button onClick={handleManualBidSubmit} className="bid-btn manual-bid-btn">
            Enchère manuelle
          </button>
        </div>
        <div className="bid-option">
          <input
            type="number"
            placeholder="Montant maximum automatique"
            value={autoBid}
            onChange={(e) => setAutoBid(e.target.value)}
            className="bid-input"
          />
          <button onClick={handleAutoBidSubmit} className="bid-btn auto-bid-btn">
            Enchère automatique
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidForm;
