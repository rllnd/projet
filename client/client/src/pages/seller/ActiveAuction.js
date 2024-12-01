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
  Box,
  useMediaQuery,
} from '@mui/material';
import { teal, grey } from '@mui/material/colors';

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  function calculateTimeLeft() {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  return timeLeft.days <= 0 &&
    timeLeft.hours <= 0 &&
    timeLeft.minutes <= 0 &&
    timeLeft.seconds <= 0 ? (
    <Typography color="error" sx={{ fontWeight: 'bold' }}>Terminé</Typography>
  ) : (
    <Typography sx={{ fontWeight: 'bold', color: teal[700] }}>
      {timeLeft.days > 0 && `${timeLeft.days}j `}
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </Typography>
  );
};

const ActiveAuctions = () => {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const isMobile = useMediaQuery('(max-width:600px)'); // Détecte les écrans de petite taille

  useEffect(() => {
    fetchActiveAuctions();
  }, []);

  const fetchActiveAuctions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/auctions/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveAuctions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères actives :', error);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        marginBottom: '2rem',
        maxWidth: '90%',
        margin: 'auto',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: grey[100],
      }}
    >
      <Typography variant="h4" align="center" gutterBottom color={teal[600]}>
        <strong>Enchères Actives</strong>
      </Typography>
      <Table
        sx={{
          tableLayout: isMobile ? 'auto' : 'fixed', // Table auto pour mobile
          '& th': {
            backgroundColor: teal[700], // Couleur d'en-tête
            color: 'white', // Couleur du texte dans l'en-tête
            fontWeight: 'bold',
            textAlign: 'center',
          },
          '& td': {
            color: grey[800], // Couleur du texte dans les cellules
            textAlign: 'center',
            wordWrap: 'break-word', // Permet le retour à la ligne dans les petites cellules
          },
          '& tr:nth-of-type(odd)': {
            backgroundColor: grey[100], // Fond des lignes impaires
          },
          '& tr:nth-of-type(even)': {
            backgroundColor: 'white', // Fond des lignes paires
          },
          '& tr:hover': {
            backgroundColor: teal[50], // Effet au survol
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell>Prix Actuel</TableCell>
            <TableCell>Catégorie</TableCell>
            <TableCell>Temps Restant</TableCell>
            <TableCell>Acheteurs</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activeAuctions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="textSecondary">Aucune enchère active pour le moment.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            activeAuctions.map((auction) => (
              <TableRow
                key={auction.id}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: grey[100],
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: 'white',
                  },
                  '&:hover': {
                    backgroundColor: teal[50],
                  },
                }}
              >
                <TableCell>{auction.articleDetails?.name || 'Nom non disponible'}</TableCell>
                <TableCell>{auction.currentHighestBid || 0} GTC</TableCell>
                <TableCell>{auction.articleDetails?.category || 'Catégorie non disponible'}</TableCell>
                <TableCell>
                  <CountdownTimer endDate={auction.endDate} />
                </TableCell>
                <TableCell>
                  {Array.isArray(auction.bids) && auction.bids.length > 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '4px',
                        maxWidth: isMobile ? '150px' : '300px',
                        overflowX: 'auto',
                      }}
                    >
                      {auction.bids.map((bid, index) => (
                        <Chip
                          key={index}
                          label={`${bid.bidder?.name || 'Acheteur inconnu'} (${bid.amount || 0} GTC)`}
                          sx={{
                            margin: '4px',
                            backgroundColor: teal[300],
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      ))}
                    </Box>
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ActiveAuctions;
