import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { teal, blue, amber, green, grey } from '@mui/material/colors';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/dashboard-overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4 }}>
        <CircularProgress />
        <Typography variant="h6">Chargement des données...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography variant="h6" sx={{ textAlign: 'center', color: 'red' }}>{error}</Typography>;
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: grey[100], minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: teal[900], fontWeight: 'bold', textAlign: 'center' }}>
        Vue d’Ensemble de l'Acheteur
      </Typography>
      <Grid container spacing={3} alignItems="stretch">

        {/* Solde Actuel */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: blue[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: blue[500], mb: 2 }}>
                <MonetizationOnIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Solde Actuel</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.balance || '0 GTC'}</Typography>
              <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>Equivalent : {data?.balanceInAriary || '0 Ariary'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Enchères en Cours */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: green[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: green[500], mb: 2 }}>
                <GavelIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Enchères en Cours</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.activeBids || 0} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Enchères Gagnées */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: amber[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: amber[500], mb: 2 }}>
                <AssignmentTurnedInIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Enchères Gagnées</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.wonBids || 0} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Historique des Transactions */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: grey[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: grey[700], mb: 2 }}>
                <HistoryIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Historique des Transactions</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.transactionCount || 0} Transactions</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: teal[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: teal[500], mb: 2 }}>
                <NotificationsIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Notifications</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.notifications || 0} Non lues</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taux de Conversion */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: teal[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: teal[500], mb: 2 }}>
                <SwapVertIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Taux de Conversion</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>1 GTC = {data?.conversionRate || 'N/A'} Ariary</Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Overview;