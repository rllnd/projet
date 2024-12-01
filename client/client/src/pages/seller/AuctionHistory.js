// AuctionHistory.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Typography } from '@mui/material';
import { teal } from '@mui/material/colors';

const AuctionHistory = () => {
  const [auctionHistory, setAuctionHistory] = useState([]);

  useEffect(() => {
    fetchAuctionHistory();
  }, []);

  const fetchAuctionHistory = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/auctions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctionHistory(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des enchères :", error);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" align="center" gutterBottom color="teal">
              <strong>Historique des enchères</strong>
         </Typography>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: teal[500] }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titre</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix Final</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de Clôture</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Gagnant</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {auctionHistory.map((history) => (
            <TableRow key={history.id}>
              <TableCell>{history.articleName}</TableCell>
              <TableCell>{history.finalPrice} GTC</TableCell>
              <TableCell>{history.endDate}</TableCell>
              <TableCell>{history.winner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuctionHistory;
