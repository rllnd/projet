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
import CancelAuctionDialog from './CancelAuctionDialog'; // Modale pour annulation d'une enchère

const ActiveAuctions = ({ isAdmin = true }) => {
  const [auctions, setAuctions] = useState([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);

  // Charger les enchères
  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        isAdmin
          ? 'http://localhost:5000/api/superadmin/admin/all'
          : 'http://localhost:5000/api/auctions/active',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAuctions(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Accès refusé : vous devez être administrateur pour accéder à cette section.');
      } else {
        console.error('Erreur lors de la récupération des enchères actives :', error);
      }
    }
  };

  // Stopper une enchère
  const handleStopAuction = async (auctionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/superadmin/auctions/stop/${auctionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAuctions();
      alert('Enchère arrêtée avec succès.');
    } catch (error) {
      console.error("Erreur lors de l'arrêt de l'enchère :", error);
      alert('Échec de l\'arrêt de l\'enchère.');
    }
  };

  // Gérer l'ouverture de la modale d'annulation
  const handleCancelClick = (auctionId) => {
    setSelectedAuctionId(auctionId);
    setOpenCancelDialog(true);
  };

  // Confirmer l'annulation
  const handleConfirmCancel = async (reason, additionalComment) => {
    setOpenCancelDialog(false);
    if (!selectedAuctionId) return;
  
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/superadmin/auctions/cancel/${selectedAuctionId}`,
        { reason, additionalComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAuctions(); // Recharge les enchères après annulation
      alert('Enchère annulée avec succès.');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'enchère :', error);
      alert('Échec de l\'annulation de l\'enchère.');
    }
  };
  

  return (
    <>
      <TableContainer component={Paper} sx={{ maxWidth: '90%', margin: 'auto', marginBottom: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom color={teal[700]}>
          {isAdmin ? 'Toutes les Enchères Actives' : 'Mes Enchères Actives'}
        </Typography>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: teal[500] }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix Actuel</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
              {isAdmin && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendeur</TableCell>}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acheteurs</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
              {isAdmin && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {auctions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                  <Typography color="textSecondary">Aucune enchère active pour le moment.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              auctions.map((auction) => (
                <TableRow key={auction.id}>
                  <TableCell>{auction.articleDetails?.name || 'Non disponible'}</TableCell>
                  <TableCell>{auction.currentHighestBid || 0} GTC</TableCell>
                  <TableCell>{auction.articleDetails?.category || 'Non disponible'}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      {auction.articleDetails?.seller?.name || 'Vendeur inconnu'}
                    </TableCell>
                  )}
                  <TableCell>
                    {auction.bids?.length > 0 ? (
                      auction.bids.map((bid, index) => (
                        <Chip
                          key={index}
                          label={`${bid.bidderName || 'Acheteur inconnu'} (${bid.amount || 0} GTC)`}
                          sx={{ margin: '0 4px 4px 0' }}
                          color="success"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Aucun acheteur
                      </Typography>
                    )}
                  </TableCell>
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
                        sx={{ marginRight: 1 }}
                        onClick={() => handleStopAuction(auction.id)}
                      >
                        Stopper
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => handleCancelClick(auction.id)}
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
      <CancelAuctionDialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};

export default ActiveAuctions;
