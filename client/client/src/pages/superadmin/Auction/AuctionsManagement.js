import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Typography
} from '@mui/material';
import axios from '../../../../src/assets/axiosConfig';

const AuctionsManagement = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const { data } = await axios.get('/api/admin/auctions');
        setAuctions(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des enchères", error);
      }
    };
    fetchAuctions();
  }, []);

  const handleStopAuction = async (auctionId) => {
    try {
      await axios.put(`/api/admin/auctions/${auctionId}/stop`);
      setAuctions(auctions.map(auction =>
        auction.id === auctionId ? { ...auction, isActive: false } : auction
      ));
    } catch (error) {
      console.error("Erreur lors de l'arrêt de l'enchère", error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Gestion des Enchères
      </Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>ID</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Prix de départ</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auctions.map(auction => (
              <TableRow key={auction.id}>
                <TableCell>{auction.id}</TableCell>
                <TableCell>{auction.title}</TableCell>
                <TableCell>{auction.starting_price} €</TableCell>
                <TableCell sx={{ color: auction.isActive ? 'green' : 'gray' }}>
                  {auction.isActive ? 'Active' : 'Inactif'}
                </TableCell>
                <TableCell align="center">
                  {auction.isActive && (
                    <Button
                      onClick={() => handleStopAuction(auction.id)}
                      variant="contained"
                      color="warning"
                      sx={{ ml: 1 }}
                    >
                      Arrêter
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuctionsManagement;
