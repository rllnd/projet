import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CreateIcon from '@mui/icons-material/Create';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HistoryIcon from '@mui/icons-material/History';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { teal, blue, amber, green, grey } from '@mui/material/colors';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get('http://localhost:5000/api/vendors/vendor-dashboard-overview', {
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
        Vue d’Ensemble du Vendeur
      </Typography>
      <Grid container spacing={3} alignItems="stretch">

        {/* Mes Articles */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: blue[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: blue[500], mb: 2 }}>
                <ArticleIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Mes Articles</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.articles || 0} Articles</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Créer Articles */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: green[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: green[500], mb: 2 }}>
                <CreateIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Créer Articles</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mes Enchères Arrêtées */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: amber[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: amber[500], mb: 2 }}>
                <ListAltIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Mes Enchères Arrêtées</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.auctionsStopped || 0} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Enchères Actives */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: teal[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: teal[500], mb: 2 }}>
                <ListAltIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Enchères Actives</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.activeAuctions || 0} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Enchères Annulées */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: blue[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: blue[500], mb: 2 }}>
                <ListAltIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Enchères Annulées</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.cancelledAuctions || 0} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Toutes les Enchères */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: green[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: green[500], mb: 2 }}>
                <ListAltIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Toutes les Enchères</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.allAuctions || 0} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Historique des Enchères */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: amber[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: amber[500], mb: 2 }}>
                <HistoryIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Historique des Enchères</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.auctionHistory || 0} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Historique des Ventes */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: teal[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: teal[500], mb: 2 }}>
                <HistoryIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Historique des Ventes</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.salesHistory || 0} Ventes</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portefeuille */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: blue[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: blue[500], mb: 2 }}>
                <MonetizationOnIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Portefeuille</Typography>
              <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>{data?.portfolio || 0} GTC</Typography>
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

      </Grid>
    </Box>
  );
};

export default Overview;