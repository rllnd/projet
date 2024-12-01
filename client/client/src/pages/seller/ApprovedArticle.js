import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, IconButton, Box, Chip, Modal, TextField, Button, Grid, Tooltip, Avatar,
} from '@mui/material';
import { teal, red, grey, blue } from '@mui/material/colors';
import EditIcon from '@mui/icons-material/Edit';
import GavelIcon from '@mui/icons-material/Gavel'; // Icône pour enchère
import DeleteIcon from '@mui/icons-material/Delete'; // Icône pour supprimer

const SellerArticles = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newImgFile, setNewImgFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);

  // Fetch Articles
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Aucun token trouvé. Veuillez vous connecter.');
      const response = await axios.get('http://localhost:5000/api/articles/my-articles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(response.data); // Met à jour les articles pour le tableau de bord
    } catch (error) {
      console.error("Erreur lors de la récupération des articles :", error);
      setError("Impossible de charger vos articles.");
    }
  };

  const openEditModal = (article) => {
    setSelectedArticle({ ...article, gallery: Array.isArray(article.gallery) ? article.gallery : [] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setNewImgFile(null);
    setNewGalleryFiles([]);
    setModalOpen(false);
  };

  const handleAuction = async (articleId) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir lancer l'enchère pour cet article ?");
    if (!confirmation) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:5000/api/auctions/create`,
        { articleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("L'enchère a été créée avec succès.");
      fetchArticles(); // Actualisez la liste des articles
    } catch (error) {
      console.error("Erreur lors de la mise en enchère de l'article :", error);
      alert("Impossible de lancer l'enchère.");
    }
  };

  const handleImageChange = (e) => setNewImgFile(e.target.files[0]);

  const handleGalleryChange = (e) => setNewGalleryFiles(Array.from(e.target.files));

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('name', selectedArticle.name);
      formData.append('category', selectedArticle.category);
      formData.append('price', selectedArticle.price);
      formData.append('shortDesc', selectedArticle.shortDesc); // Description courte
      formData.append('fullDesc', selectedArticle.fullDesc);
      formData.append('endDate', selectedArticle.endDate); 
      if (newImgFile) formData.append('imgFile', newImgFile);
      newGalleryFiles.forEach((file, index) => formData.append(`galleryFiles`, file));

      await axios.put(`http://localhost:5000/api/articles/${selectedArticle.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert("Article mis à jour avec succès");
      fetchArticles();
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article :", error);
      alert("Échec de la mise à jour de l'article.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/articles/${selectedArticle.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(articles.filter(article => article.id !== selectedArticle.id));
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article :", error);
      alert("Échec de la suppression de l'article.");
    }
  };

  return (
    <Box sx={{ backgroundColor: grey[100], minHeight: '100vh', padding: '2rem' }}>
      <Typography variant="h4" color={teal[600]} align="center" gutterBottom>
        <strong>Mes Articles</strong>
      </Typography>

      {error && <Typography color="error" align="center">{error}</Typography>}

      <TableContainer component={Paper} sx={{ maxWidth: '95%', margin: 'auto', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: teal[500] }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id} hover sx={{ '&:hover': { backgroundColor: grey[200] } }}>
                <TableCell>
                  <Avatar
                    src={`http://localhost:5000/${article.imgUrl}`}
                    alt={article.name}
                    sx={{ width: 56, height: 56, border: '1px solid', borderColor: grey[400] }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{article.name}</TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>{article.price} GTC</TableCell>
                <TableCell>
                  <Chip
                    label={article.isApproved ? (article.isAuctioned ? "En enchère" : "Approuvé") : "En attente"}
                    color={article.isApproved ? (article.isAuctioned ? "primary" : "success") : "warning"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
         
                    <IconButton color="info" onClick={() => openEditModal(article)}>
                      <EditIcon />
                    </IconButton>
              
                  {article.isApproved && !article.isAuctioned && (
                    <Tooltip title="Lancer l'enchère">
                      <Button
                        variant="contained"
                        startIcon={<GavelIcon />}
                        size="small"
                        onClick={() => handleAuction(article.id)}
                        sx={{
                          bgcolor: teal[700],
                          '&:hover': { bgcolor: teal[800], boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)' },
                          fontWeight: 'bold',
                          borderRadius: 2,
                          textTransform: 'none',
                          color: 'white',
                          padding: '6px 12px',
                        }}
                      >
                        Lancer l'enchère
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, // Réduit la largeur de la modale
          bgcolor: 'background.paper', p: 3, // Réduit le padding
          boxShadow: 24, borderRadius: 2,
        }}>
          <Typography variant="h5" gutterBottom align="center" color="teal"><strong>Modifier l'Article</strong></Typography>

          <Grid container spacing={2}> {/* Espacement réduit */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Titre"
                value={selectedArticle?.name || ''}
                onChange={(e) => setSelectedArticle({ ...selectedArticle, name: e.target.value })}
                fullWidth
                size="small" // Réduit la taille du champ
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Catégorie"
                value={selectedArticle?.category || ''}
                onChange={(e) => setSelectedArticle({ ...selectedArticle, category: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Prix"
                type="number"
                value={selectedArticle?.price || ''}
                onChange={(e) => setSelectedArticle({ ...selectedArticle, price: parseFloat(e.target.value) })}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date de Fin"
                type="date"
                value={selectedArticle?.endDate || ''}
                onChange={(e) => setSelectedArticle({ ...selectedArticle, endDate: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Description courte"
                value={selectedArticle?.shortDesc || ''}
                onChange={(e) => setSelectedArticle({ ...selectedArticle, shortDesc: e.target.value })}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Description complète"
                value={selectedArticle?.fullDesc || ''}
                onChange={(e) => setSelectedArticle({ ...selectedArticle, fullDesc: e.target.value })}
                fullWidth
                multiline
                rows={3} // Réduit le nombre de lignes pour gagner de la place
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Image principale</Typography>
              {selectedArticle?.imgUrl && (
                <Box sx={{ mb: 1 }}>
                  <img src={`http://localhost:5000/${selectedArticle.imgUrl}`} alt="Image Principale" style={{ width: '100%', borderRadius: 5 }} />
                </Box>
              )}
              <input type="file" onChange={handleImageChange} accept="image/*" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Galerie d'images</Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {selectedArticle?.gallery && Array.isArray(selectedArticle.gallery) && selectedArticle.gallery.map((img, index) => (
                  <img key={index} src={`http://localhost:5000/${img}`} alt={`Gallery ${index + 1}`} style={{ width: '48%', height: 'auto', borderRadius: 5 }} />
                ))}
              </Box>
              <input type="file" multiple onChange={handleGalleryChange} accept="image/*" style={{ marginTop: '5px' }} />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="space-between" mt={2}> {/* Réduit l'espacement vertical */}
            <Button
              variant="contained"
              sx={{ bgcolor: teal[500], '&:hover': { bgcolor: teal[700] } }}
              onClick={handleEditSubmit}
              size="small" // Réduit la taille du bouton
            >
              Enregistrer
      </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: red[700], '&:hover': { bgcolor: red[800] } }}
              onClick={handleDelete}
              size="small"
            >
              Supprimer
      </Button>
            <Button onClick={closeModal} size="small">Annuler</Button>
          </Box>
        </Box>
      </Modal>
   
    </Box>
  );
};

export default SellerArticles;