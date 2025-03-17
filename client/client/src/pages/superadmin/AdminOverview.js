import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GavelIcon from '@mui/icons-material/Gavel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { teal, blue, amber, green, grey, red } from '@mui/material/colors';
import ArticleIcon from '@mui/icons-material/Article'; // Icône pour les articles
import ErrorIcon from '@mui/icons-material/Error'; // Icône pour les articles rejetés
const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      console.log("🔍 Token utilisé :", token);

      try {
        const response = await axios.get('http://localhost:5000/api/overview', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📊 Données reçues depuis l'API :", response.data);

        // Vérification de la structure des données API
        if (response.data && response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          console.error("🚨 Structure inattendue de la réponse API :", response.data);
          setError("Données non valides reçues.");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des données :", error);
        setError("Erreur lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("📢 Mise à jour de l'état `data` :", data);
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4 }}>
        <CircularProgress />
        <Typography variant="h6">Chargement des données...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography variant="h6" sx={{ textAlign: 'center', color: red[500] }}>{error}</Typography>;
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: grey[100], minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: teal[900], fontWeight: 'bold', textAlign: 'center' }}>
        Tableau de Bord Administrateur
      </Typography>
      <Grid container spacing={3} alignItems="stretch">

        {/* Total Utilisateurs */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: blue[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: blue[500], mb: 2 }}>
                <GroupIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Utilisateurs Inscrits</Typography>
              <Typography variant="h6">{data?.totalUsers ?? "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Articles en attente d'approbation */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: grey[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: grey[700], mb: 2 }}>
                <ArticleIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Articles en Attente</Typography>
              <Typography variant="h6">{data?.pendingArticles ?? "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: red[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: red[500], mb: 2 }}>
                <ErrorIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Articles Rejetés</Typography>
              <Typography variant="h6">{data?.rejectedArticles ?? "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Transactions */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: green[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: green[500], mb: 2 }}>
                <ReceiptIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Transactions</Typography>
              <Typography variant="h6">{data?.totalTransactions ?? "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: red[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: red[500], mb: 2 }}>
                <MonetizationOnIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Enchères actives</Typography>
              <Typography variant="h6">{data?.activeAuctions ?? "N/A"}</Typography></CardContent>
          </Card>
        </Grid>

        {/* Total Enchères */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: amber[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: amber[500], mb: 2 }}>
                <GavelIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Enchères</Typography>
              <Typography variant="h6">{data?.totalAuctions ?? "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenus de la Plateforme */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: red[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: red[500], mb: 2 }}>
                <MonetizationOnIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Revenus Plateforme</Typography>
              <Typography variant="h6">{data?.platformRevenue ? `${data.platformRevenue.toFixed(2)} GTC` : "N/A"}</Typography>
              <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
                    Equivalent : {data?.balanceInAriary ? `${data.balanceInAriary.toLocaleString()} MGA` : '0 Ariary'}
                </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: grey[50], height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: grey[700], mb: 2 }}>
                <NotificationsIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Notifications Non Lues</Typography>
              <Typography variant="h6">{data?.pendingNotifications ?? "N/A"}</Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AdminOverview;
