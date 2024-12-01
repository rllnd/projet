import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Typography, Box } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const PlatformBalance = () => {
  const [platformBalance, setPlatformBalance] = useState(null);

  useEffect(() => {
    const fetchPlatformBalance = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/superadmin/platform-balance', {
          headers: {
            Authorization: `Bearer ${token}`, // Ajout du token dans l'en-tête
          },
        });
        setPlatformBalance(response.data.platformBalance);
      } catch (error) {
        console.error("Erreur lors de la récupération du solde de la plateforme :", error);
      }
    };
    fetchPlatformBalance();
  }, []);

  return (
    <Card variant="outlined" sx={{ padding: 4, maxWidth: 600, margin: '0 auto', backgroundColor: '#f9f9f9' }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <MonetizationOnIcon sx={{ fontSize: 40, color: '#ff6f00' }} />
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ textAlign: 'center' }}>
          Solde de la Plateforme
        </Typography>
      </Box>
      <Typography variant="h4" color="primary" sx={{ mt: 1, textAlign: 'center' }}>
        {platformBalance !== null ? `${platformBalance} GTC` : 'Chargement...'}
      </Typography>
    </Card>
  );
};

export default PlatformBalance;
