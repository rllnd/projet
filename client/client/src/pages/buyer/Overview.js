import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Grid, Avatar } from '@mui/material';
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

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    axios.get('http://localhost:5000/api/dashboard-overview')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des données :", error);
        setLoading(false);
      });
  }, []);

  const defaultData = {
    balance: "0 GTC",
    balanceInAriary: "0 Ariary",
    activeBids: 0,
    wonBids: 0,
    transactionCount: 0,
    notifications: 0,
    conversionRate: "N/A"
  };

  const displayData = data || defaultData;

  return (
    <Box sx={{ padding: 4, backgroundColor: grey[100], minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: teal[900], fontWeight: 'bold', textAlign:'center' }}>
        Vue d’Ensemble
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        
        {/* Solde Actuel */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: blue[50],
              height: '100%',
              padding: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: blue[500], width: 56, height: 56, mb: 2, mx: 'auto' }}>
                <MonetizationOnIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Solde Actuel</Typography>
              <Typography variant="subtitle2">{displayData.balance}</Typography>
              <Typography variant="caption" color="textSecondary">Equivalent : {displayData.balanceInAriary}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Enchères en Cours */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: green[50],
              height: '100%',
              padding: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: green[500], width: 56, height: 56, mb: 2, mx: 'auto' }}>
                <GavelIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Enchères en Cours</Typography>
              <Typography variant="subtitle2">{displayData.activeBids} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Enchères Gagnées */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: amber[50],
              height: '100%',
              padding: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: amber[500], width: 56, height: 56, mb: 2, mx: 'auto' }}>
                <AssignmentTurnedInIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Enchères Gagnées</Typography>
              <Typography variant="subtitle2">{displayData.wonBids} Enchères</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taux de Conversion */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: teal[50],
              height: '100%',
              padding: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: teal[500], width: 56, height: 56, mb: 2, mx: 'auto' }}>
                <SwapVertIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Taux de Conversion</Typography>
              <Typography variant="subtitle2">1 GTC = {displayData.conversionRate} Ariary</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Historique des Transactions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: grey[50],
              height: '100%',
              padding: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: grey[700], width: 56, height: 56, mb: 2, mx: 'auto' }}>
                <HistoryIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Historique des Transactions</Typography>
              <Typography variant="subtitle2">{displayData.transactionCount} Transactions</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: teal[50],
              height: '100%',
              padding: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
              },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: teal[500], width: 56, height: 56, mb: 2, mx: 'auto' }}>
                <NotificationsIcon />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
              <Typography variant="subtitle2">{displayData.notifications} Non lues</Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Overview;
