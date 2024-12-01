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

const EncheresEnCours = () => {
  const [participatingBids, setParticipatingBids] = useState([]);

  // Récupération des enchères participées
  const fetchParticipatingBids = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/bids/participating', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log('Réponse des enchères participées :', response.data);
  
      // Grouper les enchères par article (une seule ligne par article)
      const groupedBids = response.data.reduce((acc, bid) => {
        console.log('Vérification des détails de l\'article pour l\'enchère :', bid);
        if (!acc[bid.articleDetails?.name]) {
          acc[bid.articleDetails?.name] = bid; // Ajouter l'article si non présent
        } else if (acc[bid.articleDetails?.name].yourBid < bid.yourBid) {
          acc[bid.articleDetails?.name] = bid; // Mettre à jour avec la mise la plus haute
        }
        return acc;
      }, {});
  
      setParticipatingBids(Object.values(groupedBids)); // Convertir en tableau
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères participées :', error.response?.data || error.message);
    }
  };
  
  // Fonction pour mettre à jour une mise
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
        { auctionId, bidAmount: newBidAmount }, // Utilisez toujours auctionId ici
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Réponse du backend après la mise :', response.data);
  
      // Rafraîchissez les données après la mise
      fetchParticipatingBids();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'enchère :', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Erreur lors de la soumission de votre mise.');
    }
  };
  
  
  useEffect(() => {
    fetchParticipatingBids();
  }, []);

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
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Enchère la Plus Élevée (GTC)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Temps Restant</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participatingBids.length > 0 ? (
              participatingBids.map((bid) => (
                <TableRow key={bid.id} sx={{ backgroundColor: teal[50] }}>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: teal[900] }}>
                    {bid.articleDetails.name}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: teal[800] }}>
                    {bid.yourBid} GTC
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', color: teal[800] }}>
                    {bid.highestBid || 'Aucune mise'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', color: teal[700] }}>
                    <CountdownTimer endDate={bid.endDate} /> {/* Utilisation du CountdownTimer */}
                  </TableCell>
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
                              console.log('Envoi de la mise avec auctionId :', bid.id); // `bid.id` correspond à `auctionId`
                              handlePlaceBid(bid.id, newBidAmount);
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
