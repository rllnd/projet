import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit, Delete, Category } from '@mui/icons-material'; // Importer l'icône de catégorie
import { message, Modal } from 'antd';
import axios from 'axios';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCategories(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des catégories.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      };
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/update/${selectedCategory.id}`, formData, config);
        message.success('Catégorie mise à jour avec succès!');
      } else {
        await axios.post(`${API_BASE_URL}/create`, formData, config);
        message.success('Catégorie créée avec succès!');
      }
      fetchCategories();
      setFormData({ name: '', description: '' });
      setIsEditMode(false);
    } catch (error) {
      message.error("Erreur lors de l'enregistrement de la catégorie.");
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description });
    setSelectedCategory(category);
    setIsEditMode(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Confirmation de suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
      okText: 'Oui',
     
      cancelText: 'Non',
      onOk: async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          };
          await axios.delete(`${API_BASE_URL}/delete/${id}`, config);
          message.success('Catégorie supprimée avec succès!');
          fetchCategories();
        } catch (error) {
          message.error('Erreur lors de la suppression de la catégorie.');
        }
      },
    });
  };

  return (
    <Box sx={{ padding: 2, maxWidth: '100%', margin: 'auto', backgroundColor: '#f0f4f8' }}>
      <Typography variant="h5" sx={{ marginBottom: 2, textAlign: 'center', color: '#00796b' }}>
        Gestion des Catégories
      </Typography>

      <Paper sx={{ padding: 2, marginBottom: 3, backgroundColor: '#ffffff', boxShadow: 3 }}>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="Nom"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              
              required
              size="small"
              sx={{ bgcolor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              
              size="small"
              sx={{ bgcolor: '#fff' }}
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              
              onClick={handleSubmit}
              disabled={!formData.name}
              sx={{ width: '20%', backgroundColor: '#00796b',textTransform: 'none', '&:hover': { backgroundColor: '#00796b' } }}
            >
              {isEditMode ? 'Mettre à jour' : 'Créer'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Paper sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f7fa', boxShadow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Category sx={{ marginRight: 1, color: 'black' }} /> {/* Icône de catégorie */}
                  <Box>
                    <Typography variant="h6" sx={{ color: 'black' }}>{category.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#455a64' }}>{category.description}</Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton color="primary" onClick={() => handleEdit(category)} aria-label="Modifier">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(category.id)} aria-label="Supprimer">
                    <Delete />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CategoryManager;