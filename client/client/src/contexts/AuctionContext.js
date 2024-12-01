import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuctionContext = createContext();

export const AuctionProvider = ({ children }) => {
  const [auctions, setAuctions] = useState([]);

  const fetchAuctions = async () => {
    const response = await axios.get('/api/auctions');
    setAuctions(response.data);
  };

  return (
    <AuctionContext.Provider value={{ auctions, fetchAuctions }}>
      {children}
    </AuctionContext.Provider>
  );
};
