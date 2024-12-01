import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Modal, Box, TextField, Chip } from '@mui/material';
import { teal, grey } from '@mui/material/colors';

const SellerAuctions = () => {
  const [approvedArticles, setApprovedArticles] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [auctionHistory, setAuctionHistory] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isAuctionModalOpen, setAuctionModalOpen] = useState(false);
  const [auctionDetails, setAuctionDetails] = useState({
    duration: '',
    minIncrement: '',
    startingPrice: ''
  });

  useEffect(() => {
    fetchApprovedArticles();
    fetchActiveAuctions();
    fetchAuctionHistory();
  }, []);

  // Fetch articles approved for auction
  const fetchApprovedArticles = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/articles/approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovedArticles(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des articles approuvés :", error);
    }
  };

  // Fetch active auctions
  const fetchActiveAuctions = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get('http://localhost:5000/api/auctions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveAuctions(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des enchères actives :", error);
    }
  };

  // Fetch auction history
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

  const openAuctionModal = (article) => {
    setSelectedArticle(article);
    setAuctionDetails({ duration: '', minIncrement: '', startingPrice: article.price });
    setAuctionModalOpen(true);
  };

  const handleAuctionSubmit = async () => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(`http://localhost:5000/api/auctions/start/${selectedArticle.id}`, auctionDetails, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctionModalOpen(false);
      fetchActiveAuctions(); // Refresh active auctions
    } catch (error) {
      console.error("Erreur lors du lancement de l'enchère :", error);
      alert("Échec du lancement de l'enchère.");
    }
  };

  return (
    <Box sx={{ backgroundColor: grey[100], minHeight: '100vh', padding: '2rem' }}>
      <Typography variant="h4" color={teal[600]} align="center" gutterBottom>
        <strong>Gestion des Enchères</strong>
      </Typography>

      {/* Section : Lancement d'Enchères */}
      <Typography variant="h5" gutterBottom>Articles Prêts pour Enchères</Typography>
      <TableContainer component={Paper} sx={{ marginBottom: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Prix de Départ</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvedArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>{article.name}</TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>{article.price} GTC</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => openAuctionModal(article)}>
                    Lancer Enchère
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Section : Enchères Actives */}
      <Typography variant="h5" gutterBottom>Enchères Actives</Typography>
      <TableContainer component={Paper} sx={{ marginBottom: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Prix Actuel</TableCell>
              <TableCell>Temps Restant</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeAuctions.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>{auction.articleName}</TableCell>
                <TableCell>{auction.currentPrice} GTC</TableCell>
                <TableCell>{auction.remainingTime}</TableCell>
                <TableCell>
                  <Chip label="En Cours" color="primary" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Section : Historique des Enchères */}
      <Typography variant="h5" gutterBottom>Historique des Enchères</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Prix Final</TableCell>
              <TableCell>Date de Clôture</TableCell>
              <TableCell>Gagnant</TableCell>
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

      {/* Modale pour lancer une enchère */}
      <Modal open={isAuctionModalOpen} onClose={() => setAuctionModalOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', p: 3, boxShadow: 24, borderRadius: 2,
        }}>
          <Typography variant="h6" align="center" gutterBottom>Lancer une Enchère</Typography>
          <TextField
            label="Durée de l'Enchère (en heures)"
            type="number"
            fullWidth
            margin="normal"
            value={auctionDetails.duration}
            onChange={(e) => setAuctionDetails({ ...auctionDetails, duration: e.target.value })}
          />
          <TextField
            label="Augmentation Minimum"
            type="number"
            fullWidth
            margin="normal"
            value={auctionDetails.minIncrement}
            onChange={(e) => setAuctionDetails({ ...auctionDetails, minIncrement: e.target.value })}
          />
          <TextField
            label="Prix de Départ"
            type="number"
            fullWidth
            margin="normal"
            value={auctionDetails.startingPrice}
            onChange={(e) => setAuctionDetails({ ...auctionDetails, startingPrice: e.target.value })}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={handleAuctionSubmit}>Confirmer</Button>
            <Button variant="outlined" onClick={() => setAuctionModalOpen(false)}>Annuler</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SellerAuctions;
