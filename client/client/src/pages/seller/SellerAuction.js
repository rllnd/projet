import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { teal, blue, amber, green, red } from '@mui/material/colors';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CancelIcon from '@mui/icons-material/Cancel';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import StopCircleIcon from '@mui/icons-material/StopCircle';

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SellerDashboardStatistics = () => {
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('daily');

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchStatistics();
  }, [timeFilter]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/auctions/statisticsSeller?filter=${timeFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Statistics data:', response.data.data);
      setStatistics(response.data.data || {});
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques :', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Créées', 'Annulées', 'En cours', 'Stoppées'],
    datasets: [
      {
        label: 'Nombre d\'enchères',
        data: [
          statistics.created || 0,
          statistics.cancelled || 0,
          statistics.ongoing || 0,
          statistics.stopped || 0,
        ],
        backgroundColor: [blue[500], red[500], amber[500], teal[500]],
        borderColor: [blue[700], red[700], amber[700], teal[700]],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Statistiques des enchères',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        gutterBottom
        sx={{ color: teal[600], textAlign: 'center' }}
      >
        Statistiques des enchères
      </Typography>

      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Période</InputLabel>
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <MenuItem value="daily">Journalière</MenuItem>
              <MenuItem value="weekly">Hebdomadaire</MenuItem>
              <MenuItem value="monthly">Mensuelle</MenuItem>
              <MenuItem value="yearly">Annuelle</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Typography align="center">Chargement des données...</Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ marginBottom: 4 }}>
            {/* Enchères Créées */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  backgroundColor: blue[100],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <DashboardIcon sx={{ fontSize: 40, color: blue[500] }} />
                <Typography variant="h6" sx={{ marginTop: 1, color: 'black' }}>
                  {statistics.created || 0}
                </Typography>
                <Typography sx={{ color: 'black' }}>Enchères Créées</Typography>
              </Paper>
            </Grid>

            {/* Enchères Annulées */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  backgroundColor: red[100],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <CancelIcon sx={{ fontSize: 40, color: red[500] }} />
                <Typography variant="h6" sx={{ marginTop: 1, color: 'black' }}>
                  {statistics.cancelled || 0}
                </Typography>
                <Typography sx={{ color: 'black' }}>Enchères Annulées</Typography>
              </Paper>
            </Grid>

            {/* Enchères en cours */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  backgroundColor: amber[100],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <QueryBuilderIcon sx={{ fontSize: 40, color: amber[500] }} />
                <Typography variant="h6" sx={{ marginTop: 1, color: 'black' }}>
                  {statistics.ongoing || 0}
                </Typography>
                <Typography sx={{ color: 'black' }}>Enchères en Cours</Typography>
              </Paper>
            </Grid>

            {/* Enchères Stoppées */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  backgroundColor: teal[100],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <StopCircleIcon sx={{ fontSize: 40, color: teal[500] }} />
                <Typography variant="h6" sx={{ marginTop: 1, color: 'black' }}>
                  {statistics.stopped || 0}
                </Typography>
                <Typography sx={{ color: 'black' }}>Enchères Stoppées</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Graphique */}
          {!isMobile && (
            <Box sx={{ maxWidth: '100%', margin: 'auto' }}>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ color: teal[600] }}
              >
                Graphique des Statistiques
              </Typography>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SellerDashboardStatistics;
