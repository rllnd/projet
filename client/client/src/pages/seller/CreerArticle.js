import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Grid, Box, Container, Paper } from '@mui/material';
import { styled } from '@mui/system';
import { blue, teal } from '@mui/material/colors';

const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: blue[50],
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: teal[500],
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: teal[700],
  },
  padding: theme.spacing(1.5),
  fontWeight: 'bold',
  minWidth: 200,
  borderRadius: '8px',
}));

const CreateArticleForm = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [imgFile, setImgFile] = useState(null); 
  const [imgPreview, setImgPreview] = useState(null);
  const [endDate, setEndDate] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]); 
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(files);
    setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('price', parseFloat(startingPrice));
      formData.append('shortDesc', shortDesc);
      formData.append('fullDesc', fullDesc);
      formData.append('endDate', endDate);
      if (imgFile) formData.append('imgFile', imgFile); // imgFile
      galleryFiles.forEach((file, index) => {
        formData.append('galleryFiles', file); // galleryFiles[]
      });

    try {
              const token = localStorage.getItem('authToken');
              await axios.post('http://localhost:5000/api/articles/create', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`, // Assurez-vous que `token` est défini
          },
        });

      
      alert('Article créé avec succès !');
    } catch (error) {
      console.error("Erreur lors de la création de l'article :", error);
      alert("Échec de la création de l'article.");
    }
  };

  return (
    <StyledContainer maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom color="teal">
        <strong>Créer un nouvel article d'enchère</strong>
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nom de l'article"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Catégorie"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Prix de départ"
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Date de fin de l'enchère"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Description courte"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              required
              multiline
              rows={2}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Description complète"
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              required
              multiline
              rows={4}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Image principale (JPG/PNG)</Typography>
            <input type="file" onChange={handleImgChange} accept="image/*" />
            {imgPreview && (
              <Paper variant="outlined" sx={{ mt: 2, p: 1, textAlign: 'center' }}>
                <img src={imgPreview} alt="Preview" style={{ width: '100%', borderRadius: 5 }} />
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Galerie d'images (max 5)</Typography>
            <input type="file" multiple onChange={handleGalleryChange} accept="image/*" />
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {galleryPreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Gallery Preview ${index + 1}`}
                  style={{ width: '48%', height: 'auto', borderRadius: 5 }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <StyledButton variant="contained" type="submit">
            Créer l'article
          </StyledButton>
        </Box>
      </Box>
    </StyledContainer>
  );
};

export default CreateArticleForm;
