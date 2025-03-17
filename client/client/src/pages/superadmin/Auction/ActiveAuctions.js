import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSocket } from '../../../contexts/SocketContext';
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
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Pagination,
  Box,
  Grid,
  useMediaQuery,
} from '@mui/material';
import { teal, grey, red } from '@mui/material/colors';
import StopIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ActiveAuctions = ({ isAdmin = true }) => {
  const [auctions, setAuctions] = useState([]);

  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const socket = useSocket(); // ✅ Utilisation du WebSocket

  useEffect(() => {
    console.log("📡 Données reçues pour les enchères :", auctions);
    fetchAuctions();

    if (socket) {

      socket.on("bid-updated", (updatedAuction) => {
        console.log("🔄 Enchère mise à jour en temps réel :", updatedAuction);

        setAuctions((prev) => {
          return prev.map((auction) =>
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
                  : auction.highestBidder, // ✅ Garder la dernière valeur si pas de mise
              }
              : auction
          );
        });
      });


      // 🔥 Mise à jour lors d'une enchère automatique (Auto-Bid)
      socket.on("auto-bid-placed", (updatedAuction) => {
        console.log("⚡ Enchère automatique placée en temps réel :", updatedAuction);

        setAuctions((prev) => {
          const updatedList = prev.map((auction) =>
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

          console.log("🔄 Nouvel état des enchères après auto-bid :", updatedList);
          return updatedList;
        });
      });


      // 🔥 Écoute des enchères stoppées en temps réel
      socket.on("auction-stopped", (stoppedAuction) => {
        console.log("🛑 Enchère stoppée en temps réel :", stoppedAuction.id);
        setAuctions((prev) =>
          prev.map((auction) =>
            auction.id === stoppedAuction.id ? { ...auction, status: "closed" } : auction
          )
        );
      });


      // 🔥 Écoute des enchères annulées en temps réel
      socket.on("auction-cancelled", (cancelledAuction) => {
        console.log("🚫 Enchère annulée en temps réel :", cancelledAuction.id);
        setAuctions((prev) => prev.filter((auction) => auction.id !== cancelledAuction.id));
      });

      

      socket.on("auction-ended", (endedAuction) => {
        console.log("🔴 Enchère terminée :", endedAuction.id);
        setAuctions((prev) => prev.filter((auction) => auction.id !== endedAuction.id));
        fetchAuctions();
      });
      
      

      return () => {
        socket.off("auction-stopped");
        socket.off("auction-cancelled");
        socket.off("bid-updated");
        socket.off("auto-bid-placed");
        socket.off("auction-ended");
      };
    }
  }, [socket]);

  useEffect(() => {
    filterAuctions();
  }, [searchTerm, filterStatus, auctions]);

  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        isAdmin
          ? 'http://localhost:5000/api/superadmin/admin/all'
          : 'http://localhost:5000/api/auctions/active',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Enchères récupérées depuis le backend :", response.data);


      setAuctions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enchères actives :', error);
    }
  };


  const filterAuctions = () => {
    let updatedAuctions = [...auctions];

    if (searchTerm) {
      updatedAuctions = updatedAuctions.filter((auction) =>
        auction.articleDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      updatedAuctions = updatedAuctions.filter((auction) => auction.status === filterStatus);
    }

    setFilteredAuctions(updatedAuctions);
  };

  const paginatedAuctions = filteredAuctions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleStopAuction = async (auctionId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Vous êtes sur le point de stopper cette enchère. Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: teal[500],
      cancelButtonColor: red[500],
      confirmButtonText: 'Oui, stopper',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/auctions/stop/${auctionId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchAuctions();
        // 🔥 WebSocket : Informer tous les clients en temps réel
        socket.emit("auction-stopped", { id: auctionId });

        Swal.fire('Succès', 'Enchère arrêtée avec succès.', 'success');
      } catch (error) {
        console.error("Erreur lors de l'arrêt de l'enchère :", error);
        Swal.fire('Erreur', "Impossible d'arrêter l'enchère.", 'error');
      }
    }
  };

  const handleCancelAuction = async (auctionId) => {
    const { value: reason } = await Swal.fire({
      title: 'Annuler l’enchère',
      input: 'textarea',
      inputLabel: 'Raison de l’annulation',
      inputPlaceholder: 'Entrez la raison ici...',
      inputAttributes: {
        'aria-label': 'Raison de l’annulation',
      },
      showCancelButton: true,
      confirmButtonColor: teal[500],
      cancelButtonColor: red[500],
      confirmButtonText: 'Soumettre',
      cancelButtonText: 'Annuler',
    });

    if (reason) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:5000/api/superadmin/auctions/cancel/${auctionId}`,
          { reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchAuctions();
        // 🔥 WebSocket : Informer tous les clients en temps réel
        socket.emit("auction-cancelled", { id: auctionId });

        Swal.fire('Succès', 'Enchère annulée avec succès.', 'success');
      } catch (error) {
        console.error("Erreur lors de l'annulation de l'enchère :", error);
        Swal.fire('Erreur', "Impossible d'annuler l'enchère.", 'error');
      }
    }
  };

  return (
    <Box sx={{ padding: isSmallScreen ? 2 : 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: teal[700] }}>
        {isAdmin ? 'Toutes les Enchères Actives' : 'Mes Enchères Actives'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: 2, marginBottom: 3 }}>
        <TextField
          label="Rechercher par titre"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField
          label="Statut"
          select
          variant="outlined"
          size="small"
          fullWidth
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="open">En cours</MenuItem>
          <MenuItem value="closed">Arrêté</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} sx={{ maxWidth: '100%', margin: 'auto', boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: teal[700] }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix Actuel</TableCell>
              {!isSmallScreen && isAdmin && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendeur</TableCell>
              )}
              {!isSmallScreen && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acheteurs</TableCell>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
              {isAdmin && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAuctions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                  <Typography color="textSecondary">Aucune enchère active pour le moment.</Typography>
                </TableCell>
              </TableRow>
            ) : (
                paginatedAuctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell>{auction.articleDetails?.name || 'Non disponible'}</TableCell>
                    <TableCell>{auction.currentHighestBid || 0} GTC</TableCell>
                    {!isSmallScreen && isAdmin && (

                      <TableCell>
                        {auction.articleDetails?.seller
                          ? `${auction.articleDetails.seller.name} ( ${auction.articleDetails.seller.email})`
                          : 'Vendeur inconnu'}
                      </TableCell>


                    )}
                    {!isSmallScreen && (
                      <TableCell>
                        {auction.highestBidder ? (
                          <Chip
                            label={`${auction.highestBidder.name} (ID: ${auction.highestBidder.id})`}
                            sx={{ backgroundColor: teal[500], color: 'white' }}
                          />
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                              Aucun enchérisseur
                            </Typography>
                          )}
                      </TableCell>


                    )}
                    <TableCell>
                      <Chip
                        label={auction.status === 'open' ? 'En cours' : 'Terminé'}
                        sx={{
                          backgroundColor: auction.status === 'open' ? teal[500] : grey[500],
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Tooltip title="Stopper l'enchère">
                          <IconButton onClick={() => handleStopAuction(auction.id)} sx={{ color: red[500] }}>
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Annuler l'enchère">
                          <IconButton onClick={() => handleCancelAuction(auction.id)} sx={{ color: grey[700] }}>
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
        <Pagination
          count={Math.ceil(filteredAuctions.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ActiveAuctions;
