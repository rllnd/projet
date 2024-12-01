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
  CircularProgress,
} from '@mui/material';
import { teal, grey, red } from '@mui/material/colors';

const CancelledAuctionsList = () => {
  const [cancelledAuctions, setCancelledAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCancelledAuctions();
  }, []);

  const fetchCancelledAuctions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/auctions/cancelled', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCancelledAuctions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères annulées :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: '90%', margin: 'auto', padding: '1rem', backgroundColor: grey[100] }}>
      <Typography variant="h5" align="center" gutterBottom color={teal[700]}>
        Enchères Annulées
      </Typography>
      {loading ? (
        <CircularProgress color="primary" style={{ display: 'block', margin: 'auto' }} />
      ) : cancelledAuctions.length === 0 ? (
        <Typography color="textSecondary" align="center">
          Aucune enchère annulée disponible.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: teal[500] }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Article</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendeur</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Raison d'annulation</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date d'annulation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cancelledAuctions.map((auction) => (
                <TableRow key={auction.id} sx={{ '&:hover': { backgroundColor: grey[200] } }}>
                  <TableCell>{auction.articleDetails?.name || 'Non disponible'}</TableCell>
                  <TableCell>{auction.articleDetails?.category || 'Non disponible'}</TableCell>
                  <TableCell>{auction.articleDetails?.price || 0} GTC</TableCell>
                  <TableCell>
                    {auction.articleDetails?.seller?.name || 'Vendeur inconnu'}
                  </TableCell>
                  <TableCell sx={{ color: red[500], fontWeight: 'bold' }}>
                    {auction.cancellationReason || 'Non spécifiée'}
                  </TableCell>
                  <TableCell>
                    {new Date(auction.updatedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default CancelledAuctionsList;
