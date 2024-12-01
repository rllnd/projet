import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Pagination,
  Typography,
  Select,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import { teal, orange, green, blue } from '@mui/material/colors';
import axios from '../../assets/axiosConfig';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('all'); // Filtre pour tous les articles, en attente, approuvés, etc.
  const [page, setPage] = useState(1);
  const [articlesPerPage] = useState(5);
  const [error, setError] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const token = localStorage.getItem('token'); // Assurez-vous que le nom du token est correct
        const response = await axios.get('http://localhost:5000/api/articles/my-articles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArticles(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des articles :", error);
        setError("Impossible de charger vos articles.");
      }
    };
    
    
    fetchArticles();
  }, []);

  const handleApproveArticle = async (articleId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/superadmin/articles/${articleId}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(articles.map(article =>
        article.id === articleId ? { ...article, isApproved: true } : article
      ));
    } catch (error) {
      console.error("Erreur lors de l'approbation de l'article", error);
    }
  };
  const handlePublishArticle = async (articleId) => {
    const token = localStorage.getItem('token');
    try {
      console.log("Tentative de publication pour l'article ID:", articleId);
      const response = await axios.put(
        `http://localhost:5000/api/superadmin/articles/${articleId}/publish`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Réponse API après publication :", response.data);
  
      setArticles((articles) =>
        articles.map((article) =>
          article.id === articleId ? { ...article, isPublished: true } : article
        )
      );
    } catch (error) {
      console.error("Erreur lors de la publication de l'article :", error);
    }
  };
  
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setPage(1); // Reset page when filter changes
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'approved') return article.isApproved && !article.isPublished;
    if (filter === 'pending') return !article.isApproved;
    if (filter === 'auction') return article.isApproved && article.isAuctioned && !article.isPublished;
    return true; // All articles
  });

  const displayedArticles = filteredArticles.slice((page - 1) * articlesPerPage, page * articlesPerPage);

  return (
    <Box p={3} sx={{ backgroundColor: teal[50], minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom color={teal[700]} align="center" fontWeight="bold">
        Gestion des Articles
      </Typography>

      <Divider sx={{ mb: 3, backgroundColor: teal[300] }} />

      {/* Filtres */}
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
        </Select>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: teal[500] }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Statut</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedArticles.map(article => (
              <TableRow key={article.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: teal[50] } }}>
                <TableCell>{article.id}</TableCell>
                <TableCell>{article.name}</TableCell>
                <TableCell>{article.shortDesc}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={article.isApproved ? (article.isPublished ? "Publié" : "Approuvé") : "En attente"}
                    sx={{
                      backgroundColor: article.isPublished
                        ? blue[700]
                        : article.isApproved
                        ? teal[700]
                        : orange[500],
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  {!article.isApproved && (
                    <Button
                      onClick={() => handleApproveArticle(article.id)}
                      variant="contained"
                      sx={{
                        backgroundColor: green[500],
                        borderRadius: 2 ,
                        color: 'white',
                        '&:hover': { backgroundColor: green[600] },
                        mr: 1,
                      }}
                    >
                      Approuver
                    </Button>
                  )}
                  {article.isApproved && article.isAuctioned && !article.isPublished && (
                    <Button
                      onClick={() => handlePublishArticle(article.id)}
                      variant="contained"
                      sx={{
                        backgroundColor: blue[500],
                        borderRadius: 2 ,
                        color: 'white',
                        '&:hover': { backgroundColor: blue[600] },
                      }}
                    >
                      Publier
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(filteredArticles.length / articlesPerPage)}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AdminArticles;
