import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import { AttachMoney as AttachMoneyIcon, CheckCircleOutline } from '@mui/icons-material';
import axios from 'axios';
import { teal, grey } from '@mui/material/colors';
import CountdownTimer from '../../components/UI/CountdownTimer'; // Import du composant
import { useSocket } from '../../contexts/SocketContext'; // ✅ Import du WebSocket
import { useMediaQuery } from '@mui/material'; // Import de useMediaQuery

const EncheresEnCours = () => {
  const [participatingBids, setParticipatingBids] = useState([]);
  const socket = useSocket(); // ✅ WebSocket
  const isMobile = useMediaQuery('(max-width:600px)'); // Vérification de la taille de l'écran

  // 📌 Récupération des enchères participées
  const fetchParticipatingBids = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/bids/participating', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Réponse des enchères participées :', response.data);

      const groupedBids = {};
      response.data.forEach((bid) => {
        if (!groupedBids[bid.auctionId] || groupedBids[bid.auctionId].yourBid < bid.yourBid) {
          groupedBids[bid.auctionId] = bid;
        }
      });

      const validBids = Object.values(groupedBids);
      console.log("✅ Enchères après filtrage :", validBids);

      setParticipatingBids(validBids);
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères participées :', error.response?.data || error.message);
    }
  };

  // 📌 Mise à jour en temps réel via WebSocket
  useEffect(() => {
    fetchParticipatingBids(); // Chargement initial

    if (socket) {
      socket.on("bid-updated", (updatedAuction) => {
        console.log("🔼 Mise à jour en temps réel :", updatedAuction);
        setParticipatingBids((prev) =>
          prev.map((bid) =>
            bid.auctionId === updatedAuction.auctionId
              ? { ...bid, highestBid: updatedAuction.currentHighestBid }
              : bid
          )
        );
      });

      socket.on("auction-stopped", (stoppedAuction) => {
        console.log("🛑 Enchère stoppée :", stoppedAuction.id);
        setParticipatingBids((prev) => prev.filter((bid) => bid.auctionId !== stoppedAuction.id));
      });

      socket.on("auction-cancelled", (cancelledAuction) => {
        console.log("🚫 Enchère annulée :", cancelledAuction.id);
        setParticipatingBids((prev) => prev.filter((bid) => bid.auctionId !== cancelledAuction.id));
      });

      socket.on("auction-ended", (endedAuction) => {
        console.log("🚨 Enchère terminée :", endedAuction.id);
        setParticipatingBids((prev) => prev.filter((bid) => bid.auctionId !== endedAuction.id));
      });

      return () => {
        socket.off("bid-updated");
        socket.off("auction-stopped");
        socket.off("auction-cancelled");
        socket.off("auction-ended");
      };
    }
  }, [socket]);

  const handlePlaceBid = async (auctionId, newBidAmount) => {
    if (!newBidAmount || newBidAmount <= 0) {
      alert('Veuillez entrer une mise valide.');
      return;
    }
  
    console.log('Données envoyées au backend :', { auctionId, bidAmount: newBidAmount });
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/bids/manual',
        { auctionId, bidAmount: newBidAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Réponse du backend après la mise :', response.data);
      fetchParticipatingBids();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enchère :', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Erreur lors de la soumission de votre mise.');
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: grey[100], borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ color: teal[700], fontWeight: 'bold', textAlign: 'center' }}>
        Enchères Participées
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: teal[600] }}>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Nom de l'Article</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Votre Dernière Mise (GTC)</TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Enchère la Plus Élevée (GTC)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Temps Restant</TableCell>
                </>
              )}
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participatingBids.length > 0 ? (
              participatingBids.map((bid) => (
                <TableRow key={`${bid.auctionId}-${bid.highestBid}`} sx={{ backgroundColor: teal[50] }}>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: teal[900] }}>
                    {bid.articleDetails.name}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: teal[800] }}>
                    {bid.yourBid} GTC
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: teal[800] }}>
                        {bid.highestBid || 'Aucune mise'}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', color: teal[700] }}>
                        <CountdownTimer endDate={bid.endDate} />
                      </TableCell>
                    </>
                  )}
                  <TableCell sx={{ textAlign: 'center' }}>
                    {bid.yourBid >= bid.highestBid ? (
                      <Chip
                        label="Vous êtes le plus offrant"
                        icon={<CheckCircleOutline sx={{ color: 'white' }} />}
                        sx={{
                          backgroundColor: teal[500],
                          color: '#fff',
                          fontWeight: 'bold',
                          px: 2,
                          py: 1,
                        }}
                      />
                    ) : (
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: teal[600],
                          '&:hover': { backgroundColor: teal[800] },
                          color: '#fff',
                          fontWeight: 'bold',
                          textTransform: 'none',
                        }}
                        startIcon={<AttachMoneyIcon />}
                        onClick={() => {
                          const newBidAmount = parseFloat(prompt('Entrez votre nouvelle mise :'));
                          if (newBidAmount > bid.highestBid) {
                            handlePlaceBid(bid.auctionId, newBidAmount);
                          } else {
                            alert('Votre nouvelle mise doit être supérieure à l\'enchère la plus élevée.');
                          }
                        }}
                      >
                        Augmenter votre mise
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: grey[600] }}>
                    Vous ne participez actuellement à aucune enchère.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EncheresEnCours;