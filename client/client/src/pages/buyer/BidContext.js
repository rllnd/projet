import React, { createContext, useState } from 'react';

export const BidContext = createContext();

export const BidProvider = ({ children }) => {
  const [userBids, setUserBids] = useState([]); // Enchères en cours pour l'utilisateur
  const [userBidsHistory, setUserBidsHistory] = useState([]); // Historique des enchères
  const [bids, setBids] = useState([]); // Toutes les enchères

  // Fonction pour ajouter une nouvelle enchère en vérifiant les doublons
  const addBid = (newBid) => {
    if (newBid.articleName && newBid.bid) {
      // Vérifiez si l'utilisateur a déjà placé une enchère pour cet article
      const existingBid = userBids.find(bid => bid.articleName === newBid.articleName);

      if (existingBid) {
        // Mettre à jour l'enchère existante
        setUserBids((prevBids) => prevBids.map(bid =>
          bid.articleName === newBid.articleName
            ? { ...bid, bid: newBid.bid, time: newBid.time }
            : bid
        ));
      } else {
        // Ajouter une nouvelle enchère si elle n'existe pas
        setUserBids((prevBids) => [...prevBids, newBid]);
      }

      // Ajout à la liste générale des enchères
      setBids((prevBids) => [...prevBids, newBid]);
    }
  };

  // Fonction pour ajouter une enchère dans l'historique
  const addBidToHistory = (bid) => {
    setUserBidsHistory((prevHistory) => [...prevHistory, bid]);
  };

  return (
    <BidContext.Provider 
      value={{ 
        bids,  // Toutes les enchères
        userBids,  // Enchères actives de l'utilisateur
        userBidsHistory,  // Historique
        addBid,  // Ajouter une nouvelle enchère
        addBidToHistory  // Ajouter à l'historique
      }}
    >
      {children}
    </BidContext.Provider>
  );
};
