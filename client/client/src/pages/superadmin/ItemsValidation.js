import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';

const ActiveAuctions = ({ isAdmin }) => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    fetchActiveAuctions();
  }, []);

  const fetchActiveAuctions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        isAdmin
          ? 'http://localhost:5000/api/auctions/admin/all'
          : 'http://localhost:5000/api/auctions/active',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAuctions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères actives :', error);
    }
  };

  const handleStopAuction = async (auctionId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:5000/api/auctions/stop/${auctionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchActiveAuctions();
      alert('Enchère arrêtée avec succès.');
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enchère :', error);
      alert('Échec de l\'arrêt de l\'enchère.');
    }
  };

  const handleCancelAuction = async (auctionId) => {
    const reason = prompt('Entrez une raison pour l\'annulation de cette enchère :');
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:5000/api/auctions/cancel/${auctionId}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchActiveAuctions();
      alert('Enchère annulée avec succès.');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'enchère :', error);
      alert('Échec de l\'annulation de l\'enchère.');
    }
  };

  return (
    <TableContainer component={Paper} sx={{ marginBottom: '2rem', maxWidth: '90%', margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom color={teal[700]}>
        <strong>Enchères Actives</strong>
      </Typography>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: teal[500] }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titre</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix Actuel</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de Fin</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
            {isAdmin && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {auctions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                <Typography color="textSecondary">Aucune enchère active pour le moment.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            auctions.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>{auction.articleDetails?.name || 'Non disponible'}</TableCell>
                <TableCell>{auction.currentHighestBid || 0} GTC</TableCell>
                <TableCell>{auction.articleDetails?.category || 'Non disponible'}</TableCell>
                <TableCell>{new Date(auction.endDate).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={auction.status === 'open' ? 'En cours' : 'Terminé'}
                    sx={{
                      backgroundColor: auction.status === 'open' ? teal[500] : grey[500],
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </TableCell>
                                {isAdmin && (
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleStopAuction(auction.id)}
                                            sx={{ marginRight: '8px' }}
                                        >
                                            Stopper
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            size="small"
                                            onClick={() => handleCancelAuction(auction.id)}
                                        >
                                            Annuler
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ActiveAuctions;
