import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/BidForm.css';

const BidForm = ({ articleId, currentBid, setCurrentBid, bids, setBids, userTokens, refreshArticle }) => {
  const [manualBid, setManualBid] = useState('');
  const [autoBid, setAutoBid] = useState('');

  useEffect(() => {
    console.log("Article ID reçu dans BidForm :", articleId); // Vérification
  }, [articleId]);

  const handleManualBidSubmit = async () => {
    if (!articleId) {
      alert("Erreur : Article ID introuvable !");
      return;
    }

    if (!manualBid || parseFloat(manualBid) <= currentBid) {
      alert("Votre enchère doit être supérieure au prix actuel.");
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/bids/manual`,
        { articleId, bidAmount: parseFloat(manualBid) }, // Notez l'utilisation de articleId
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Réponse du serveur :", response.data);
      setCurrentBid(response.data.auction.currentHighestBid);
      setBids([...bids, response.data.bid]);
      alert('Enchère placée avec succès.');
      refreshArticle(); // Mise à jour après enchère
    } catch (error) {
      console.error("Erreur lors de l'enchère manuelle :", error.response?.data || error);
      alert(error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  // Soumission d'une enchère automatique
  const handleAutoBidSubmit = async () => {
    if (!articleId) {
      alert("Erreur : Article ID introuvable !");
      return;
    }
  
    const maxBidAmount = parseFloat(autoBid);
    if (!maxBidAmount || maxBidAmount <= currentBid) {
      alert("Le montant maximal doit être supérieur au prix actuel.");
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/bids/auto`,
        { articleId, maxBidAmount }, // Assurez-vous que articleId est transmis
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Enchère automatique activée :", response.data);
      alert("Enchère automatique activée avec succès !");
      setAutoBid('');
      refreshArticle(); // Mise à jour de l'article après enchère
    } catch (error) {
      console.error("Erreur lors de l'enchère automatique :", error.response?.data || error);
      alert(error.response?.data?.message || "Une erreur est survenue.");
    }
  };
  

  return (
    <div className="bid-form">
      <h3>Placer une enchère</h3>
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
