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
  Avatar,
  TablePagination,
} from '@mui/material';
import { teal, grey, blue } from '@mui/material/colors';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useSocket } from '../../contexts/SocketContext'; // ✅ Import WebSocket

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
  const [page, setPage] = useState(0); // Page actuelle
  const [rowsPerPage, setRowsPerPage] = useState(5); // Nombre de lignes par page
  const isMobile = useMediaQuery('(max-width:600px)');
  const socket = useSocket(); // ✅ WebSocket
  
  useEffect(() => {
    fetchActiveAuctions();
    if (socket) {
      socket.on("bid-updated", (updatedAuction) => {
        console.log("🔼 Mise à jour d'enchère en temps réel :", updatedAuction);
        setActiveAuctions((prev) =>
          prev.map((auction) =>
            auction.id === updatedAuction.auctionId
              ? {
                  ...auction,
                  currentHighestBid: updatedAuction.currentHighestBid,
                  highestBidder: updatedAuction.highestBidderId
                    ? {
                        id: updatedAuction.highestBidderId,
                        name: updatedAuction.highestBidderName,
                        bidAmount: updatedAuction.currentHighestBid,
                      }
                    : null,
                }
              : auction
          )
        );
      });

      socket.on("auto-bid-placed", (updatedAuction) => {
        console.log("⚡ Enchère automatique placée en temps réel :", updatedAuction);
        setActiveAuctions((prev) => {
          return prev.map((auction) =>
            auction.id === updatedAuction.auctionId
              ? {
                  ...auction,
                  currentHighestBid: updatedAuction.currentHighestBid,
                  highestBidder: {
                    id: updatedAuction.highestBidderId,
                    name: updatedAuction.highestBidderName,
                    bidAmount: updatedAuction.currentHighestBid,
                  },
                }
              : auction
          );
        });
      });

      socket.on("auction-stopped", (stoppedAuction) => {
        console.log("🛑 Enchère stoppée en temps réel :", stoppedAuction.id);
        setActiveAuctions((prev) => prev.filter((auction) => auction.id !== stoppedAuction.id));
      });

      socket.on("auction-cancelled", (cancelledAuction) => {
        console.log("🚫 Enchère annulée en temps réel :", cancelledAuction.id);
        setActiveAuctions((prev) => prev.filter((auction) => auction.id !== cancelledAuction.id));
      });

      socket.on("auction-ended", (endedAuction) => {
        console.log("🛑 Enchère stoppée en temps réel :", endedAuction.id);
        setActiveAuctions((prev) => prev.filter((auction) => auction.id !== endedAuction.id));
      });

      return () => {
        socket.off("bid-updated");
        socket.off("auction-stopped");
        socket.off("auction-cancelled");
        socket.off("auction-ended");
        socket.off("auto-bid-placed");
      };
    }
  }, [socket]);
  
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Réinitialise la page à 0 lors du changement de lignes par page
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
          tableLayout: isMobile ? 'auto' : 'fixed',
          '& th': {
            backgroundColor: teal[700],
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          },
          '& td': {
            color: grey[800],
            textAlign: 'center',
            wordWrap: 'break-word',
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell>Prix Actuel</TableCell>
            <TableCell>Catégorie</TableCell>
            <TableCell>Temps Restant</TableCell>
            <TableCell>Plus Haut Enchérisseur</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activeAuctions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="textSecondary">
                  Aucune enchère active pour le moment.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            activeAuctions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((auction) => (
                <TableRow key={auction.id}>
                  <TableCell>{auction.articleDetails?.name || 'Nom non disponible'}</TableCell>
                  <TableCell>{auction.currentHighestBid || 0} GTC</TableCell>
                  <TableCell>{auction.articleDetails?.category || 'Catégorie non disponible'}</TableCell>
                  <TableCell>
                    <CountdownTimer endDate={auction.endDate} />
                  </TableCell>
                  <TableCell>
                    {auction.highestBidder && auction.highestBidder.name ? (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          gap: 1 
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <Avatar 
                            sx={{ 
                              width: 56, 
                              height: 56, 
                              bgcolor: blue[500],
                              border: `3px solid ${teal[500]}` 
                            }}
                          >
                            {auction.highestBidder.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <EmojiEventsIcon 
                            sx={{ 
                              position: 'absolute', 
                              bottom: -5, 
                              right: -5, 
                              color: teal[700],
                              backgroundColor: 'white',
                              borderRadius: '50%'
                            }} 
                          />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {auction.highestBidder.name}
                        </Typography>
                        <Chip 
                          label={`${auction.highestBidder?.bidAmount || auction.currentHighestBid} GTC`}  
                          color="primary" 
                          size="small" 
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Aucun enchérisseur
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

      <TablePagination
        rowsPerPageOptions={[4, 8, 16]} // Options pour le nombre de lignes par page
        component="div"
        count={activeAuctions.length} // Nombre total d'enchères
        rowsPerPage={rowsPerPage} // Nombre de lignes par page
        page={page} // Page actuelle
        onPageChange={handleChangePage} // Gestionnaire de changement de page
        onRowsPerPageChange={handleChangeRowsPerPage} // Gestionnaire de changement de lignes par page
      />
    </TableContainer>
  );
};

export default ActiveAuctions;