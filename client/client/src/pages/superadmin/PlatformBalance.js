import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Typography, Box, CircularProgress, Alert } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const API_URL = 'http://localhost:5000/api'; // Définir l'URL de l'API

const PlatformBalance = () => {
  const [platformBalance, setPlatformBalance] = useState(null); // Stocke le solde
  const [loading, setLoading] = useState(true); // Indique si le chargement est en cours
  const [error, setError] = useState(null); // Stocke les erreurs éventuelles

  // Fonction pour récupérer le solde de la plateforme
  const fetchPlatformBalance = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/platform/platform-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlatformBalance(response.data.platformBalance); // Mettre à jour l'état avec la nouvelle balance
      setError(null); // Réinitialiser l'erreur si tout va bien
      setLoading(false); // Arrêter le chargement
    } catch (err) {
      console.error('Erreur lors de la récupération du solde de la plateforme :', err);
      setError('Erreur lors de la récupération des données.'); // Définir le message d'erreur
      setLoading(false); // Arrêter le chargement
    }
  };

  // Charger les données au montage du composant et mettre à jour périodiquement
  useEffect(() => {
    fetchPlatformBalance(); // Récupérer les données au montage
    const interval = setInterval(fetchPlatformBalance, 10000); // Rafraîchir toutes les 10 secondes

    return () => clearInterval(interval); // Nettoyer l'intervalle lors du démontage
  }, []);

  return (
    <Card variant="outlined" sx={{ padding: 4, maxWidth: 600, margin: '0 auto', backgroundColor: '#f9f9f9' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <MonetizationOnIcon sx={{ fontSize: 40, color: '#ff6f00' }} />
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ textAlign: 'center' }}>
          Solde de la Plateforme
        </Typography>
      </Box>
      {loading ? (
        // Affiche une animation de chargement pendant la récupération des données
        <Box textAlign="center">
          <CircularProgress size={32} color="inherit" />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Chargement en cours...
          </Typography>
        </Box>
      ) : error ? (
        // Affiche un message d'erreur si une erreur est survenue
        <Alert severity="error" sx={{ textAlign: 'center' }}>
          {error}
        </Alert>
      ) : (
        // Affiche le solde si tout va bien
        <Typography variant="h4" color="primary" sx={{ mt: 1, textAlign: 'center' }}>
          {platformBalance} GTC
        </Typography>
      )}
    </Card>
  );
};

export default PlatformBalance;
