import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  Chip,
  Divider,
  Modal,
  TextField,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { teal, orange, green, blue, red } from '@mui/material/colors';
import { Button as AntButton, Pagination as AntPagination, notification, Popconfirm } from 'antd';
import axios from '../../assets/axiosConfig';
import { Tabs, Tab } from '@mui/material';


const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [articlesPerPage] = useState(5);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const socket = useSocket(); // Utilisation de WebSocket
  const [zoomedImg, setZoomedImg] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  // Notifications helper
  const openNotification = (type, message) => {
    notification[type]({
      message: message,
      duration: 2,
    });
  };

  

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/articles/my-articles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArticles(response.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des articles :", error);
        openNotification('error', 'Erreur lors du chargement des articles.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();

    if (socket) {
      // ✅ Gestion de la mise à jour des articles en temps réel
      const handleUpdateArticle = (updatedArticle) => {
        console.log("🔄 Article mis à jour en temps réel (Admin) :", updatedArticle);
        setArticles((prev) =>
          prev.map((article) =>
            article.id === updatedArticle.id
              ? { ...article, 
                  isAuctioned: updatedArticle.isAuctioned, 
                  isApproved: updatedArticle.isApproved, 
                  isRejected: updatedArticle.isRejected ?? article.isRejected,
                  rejectReason: updatedArticle.rejectReason ?? article.rejectReason
                }
              : article
          )
        );
      };

      // ✅ Suppression en temps réel (Correction)
      const handleDeleteArticle = (articleId) => {
        console.log("🗑️ Suppression détectée en temps réel (Admin) :", articleId);
        openNotification('info', `Un article a été supprimé (ID: ${articleId})`);
    
        setArticles((prev) => {
            if (!prev || prev.length === 0) return []; // ✅ Évite les erreurs si prev est vide
    
            const updatedArticles = prev.filter((article) => article.id !== articleId);
            console.log("📌 ID reçu pour suppression :", articleId);
            console.log("✅ Après suppression, nombre d'articles restants :", updatedArticles.length);
    
            return updatedArticles; // ✅ Création d'un nouveau tableau pour forcer React à re-render
        });
    
        // ✅ Vérification après un court délai
        setTimeout(() => {
            console.log("🔍 État mis à jour après suppression :", articles);
        }, 500);
    };
    
    


      // ✅ Ajout en temps réel
      const handleCreateArticle = (data) => {
        console.log("🟢 Article reçu dans l'Admin en temps réel :", data);
        const newArticle = data.article;

        if (!newArticle.seller) {
          console.error("⚠️ Problème : le vendeur est absent ! Correction en cours...");
          newArticle.seller = { name: "Vendeur inconnu" };
        } else {
          console.log("✅ Vendeur reçu :", newArticle.seller.name);
        }

        setArticles((prev) => {
          if (!prev) return [newArticle];
          return prev.find((article) => article.id === newArticle.id) ? prev : [newArticle, ...prev];
        });
      };

      // ✅ Écoute des événements WebSocket
      socket.on("article-updated", handleUpdateArticle);
      socket.on("article-deleted", handleDeleteArticle);
      socket.on("article-created", handleCreateArticle);

      // ✅ Nettoyage des événements WebSocket pour éviter l'accumulation
      return () => {
        socket.off("article-updated", handleUpdateArticle);
        socket.off("article-deleted", handleDeleteArticle);
        socket.off("article-created", handleCreateArticle);
      };
    }
}, [socket]);


const handleViewArticle = async (articleId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/api/articles/${articleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;

    // ✅ S'assurer que `gallery` est toujours un tableau
    if (typeof data.gallery === 'string') {
      try {
        data.gallery = JSON.parse(data.gallery);
      } catch (error) {
        console.error("Erreur de parsing JSON de la galerie :", error);
        data.gallery = [];
      }
    }
    if (!Array.isArray(data.gallery)) {
      data.gallery = [];
    }

    setSelectedArticle(data);
    setMainImage(data.imgUrl);
    setModalOpen(true);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article :", error);
    openNotification('error', 'Erreur lors de l\'ouverture des détails de l\'article.');
  }
};


  const handleApprove = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/articles/${articleId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const updatedArticle = { id: articleId, isApproved: true }; // Définition de la variable

      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, isApproved: true } : article
        )
      );

      socket.emit("update-article", updatedArticle);
      openNotification('success', "L'article a été approuvé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'approbation de l'article :", error);
      openNotification('error', 'Une erreur est survenue lors de l\'approbation.');
    }
  };
  
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      openNotification('warning', 'Veuillez saisir une raison pour le rejet.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/articles/${selectedArticle.id}/reject`,
        { rejectReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedArticle = { ...selectedArticle, isRejected: true, rejectReason }; // Définition de la variable

      setArticles((prev) =>
        prev.map((article) =>
          article.id === selectedArticle.id
            ? { ...article, isRejected: true, rejectReason }
            : article
        )
      );

      socket.emit("update-article", updatedArticle);

      setRejectModalOpen(false);
      setSelectedArticle(null);
      setRejectReason('');
      openNotification('success', "L'article a été rejeté avec succès !");
    } catch (error) {
      console.error("Erreur lors du rejet de l'article :", error);
      openNotification('error', 'Erreur lors du rejet de l\'article.');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedArticle(null);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(1);
  };

  const handlePublish = async (articleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/articles/${articleId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedArticle = { id: articleId, isPublished: true }; // Définition de la variable

      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, isPublished: true } : article
        )
      );

      socket.emit("update-article", updatedArticle);
      openNotification('success', "L'article a été publié avec succès !");
    } catch (error) {
      console.error("Erreur lors de la publication de l'article :", error);
      openNotification('error', 'Erreur lors de la publication de l\'article.');
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (filter === 'approved') return article.isApproved && !article.isPublished;
    if (filter === 'pending') return !article.isApproved;
    if (filter === 'rejected') return article.isRejected;
    if (filter === 'published') return article.isPublished;
    if (filter === 'auction') return article.isAuctioned && !article.isPublished;
    return true;
  });

  const displayedArticles = filteredArticles
  .slice((page - 1) * articlesPerPage, page * articlesPerPage)
  .map((article) => ({ ...article, key: article.id })); // ✅ Ajoute une clé unique pour chaque article


  return (
    <Box p={3} sx={{ backgroundColor: teal[50], minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom color={teal[700]} align="center" fontWeight="bold">
        Gestion des Articles
      </Typography>

      <Divider sx={{ mb: 3, backgroundColor: teal[300] }} />

      <Box mb={2} display="flex" justifyContent="flex-end">
        <Select
          value={filter}
          onChange={handleFilterChange}
          displayEmpty
          sx={{
            backgroundColor: teal[100],
            color: teal[700],
            borderRadius: '4px',
            '& .MuiSelect-icon': { color: teal[700] },
          }}
        >
          <MenuItem value="all">Tous les articles</MenuItem>
          <MenuItem value="approved">Articles approuvés</MenuItem>
          <MenuItem value="pending">Articles en attente</MenuItem>
          <MenuItem value="auction">Articles en enchère</MenuItem>
          <MenuItem value="published">Articles publiés</MenuItem>
          <MenuItem value="rejected">Articles rejetés</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ key: articles.length }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: teal[500] }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendeur</TableCell>
                {!isSmallScreen && (
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                )}
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.name}</TableCell>
                  <TableCell>{article.seller ? article.seller.name : "Vendeur inconnu"}</TableCell>
                  {!isSmallScreen && (
                    <TableCell>
                      <Chip
                        label={
                          article.isRejected
                            ? 'Rejeté'
                            : article.isPublished
                            ? 'Publié'
                            : article.isAuctioned
                            ? 'En enchère'
                            : article.isApproved
                            ? 'Approuvé'
                            : 'En attente'
                        }
                        sx={{
                          backgroundColor: article.isRejected
                            ? red[500]
                            : article.isPublished
                            ? blue[500]
                            : article.isAuctioned
                            ? orange[500]
                            : article.isApproved
                            ? green[500]
                            : teal[500],
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <AntButton
                      size="small"
                      onClick={() => handleViewArticle(article.id)}
                      style={{ marginRight: '5px' }}
                    >
                      Voir
                    </AntButton>
                    {!article.isApproved && !article.isRejected && !article.isPublished && (
                      <>
                        <AntButton
                          size="small"
                          type="primary"
                          style={{ marginRight: '5px' }}
                          onClick={() => handleApprove(article.id)}
                        >
                          Approuver
                        </AntButton>
                        <Popconfirm
                          title="Êtes-vous sûr de vouloir rejeter cet article ?"
                          onConfirm={() => {
                            setSelectedArticle(article);
                            setRejectModalOpen(true);
                          }}
                          okText="Oui"
                          cancelText="Non"
                        >
                          <AntButton size="small" danger>
                            Rejeter
                          </AntButton>
                        </Popconfirm>
                      </>
                    )}
                    
                    {article.isAuctioned && !article.isPublished && (
                   <AntButton
                      size="small"
                      type="primary"
                      style={{
                      backgroundColor: blue[500],
                        borderColor: blue[500],
                      marginLeft: '5px',
                        }}
                      onClick={() => handlePublish(article.id)}
                    >
                    Publier
                  </AntButton>
                  )} 
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <AntPagination
          current={page}
          pageSize={articlesPerPage}
          total={filteredArticles.length}
          onChange={(page) => setPage(page)}
          showSizeChanger={false}
        />
      </Box>

     

<Modal open={modalOpen} onClose={handleCloseModal}>
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 3,
      bgcolor: 'white',
      borderRadius: 2,
      maxWidth: '600px',
      width: '90%',
      mx: 'auto',
      mt: 5,
      boxShadow: 3,
      overflowY: 'auto',
      maxHeight: '90vh',
    }}
  >
    {selectedArticle && (
      <>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {selectedArticle.name}
        </Typography>

        {/* Zone Image & Infos */}
        <Box display="flex" gap={2} alignItems="center" width="100%">
          {/* Image principale */}
          <Box
            sx={{
              width: '200px',
              height: '200px',
              borderRadius: '10px',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => setZoomedImg(mainImage)}
          >
            <img
              src={mainImage}
              alt={selectedArticle.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>

          <Modal open={!!zoomedImg} onClose={() => setZoomedImg(null)}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          cursor: 'pointer',
        }}
        onClick={() => setZoomedImg(null)} // ✅ Clique pour fermer
      >
        {zoomedImg && (
          <img
            src={zoomedImg}
            alt="Zoom"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
            }}
          />
        )}
      </Box>
    </Modal>

          {/* Infos article */}
          <Box flex={1}>
            <Typography variant="h6" color="teal">
              Prix : {selectedArticle.price} GTC
            </Typography>
            <Typography variant="body2" color="textSecondary">
            {selectedArticle?.fullDesc ? selectedArticle.fullDesc.slice(0, 150) + "..." : "Description non disponible"}
          </Typography>

          </Box>
        </Box>

        {/* Onglets */}
        <Tabs
          value={tabIndex}
          onChange={(e, newIndex) => setTabIndex(newIndex)}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{ mt: 2 }}
        >
          <Tab label="Détails" />
          <Tab label="Galerie" />
        </Tabs>

        {/* Contenu selon l'onglet sélectionné */}
        {tabIndex === 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" sx={{ maxHeight: '150px', overflowY: 'auto', p: 1 }}>
              {selectedArticle.fullDesc}
            </Typography>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box mt={2} display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
          {Array.isArray(selectedArticle?.gallery) ? (
            selectedArticle.gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Gallery ${index + 1}`}
                onClick={() => setMainImage(image)}
                style={{
                  width: '80px',
                  height: '80px',
                  cursor: 'pointer',
                  borderRadius: 5,
                  objectFit: 'cover',
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              Aucune galerie disponible
            </Typography>
          )}

          </Box>
        )}
      </>
    )}
  </Box>
</Modal>
{/* Modal pour saisir la raison du rejet */}
      <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
        <Box
          sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            maxWidth: '400px',
            width: '90%',
            mx: 'auto',
            mt: 5,
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Raison du rejet
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Saisissez la raison du rejet"
          />
          <Box mt={2} display="flex" justifyContent="space-between">
            <AntButton
              size="small"
              onClick={() => setRejectModalOpen(false)}
              style={{ marginRight: '10px' }}
            >
              Annuler
            </AntButton>
            <AntButton
              size="small"
              type="primary"
              danger
              onClick={handleReject}
            >
              Confirmer
            </AntButton>
          </Box>
        </Box>
      </Modal>
   
    </Box>
  );
};

export default AdminArticles;
