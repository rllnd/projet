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
  TextField,
  CircularProgress,
} from '@mui/material';
import { Autocomplete } from '@mui/material';
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
import {
  teal,
  blue,
  amber,
  green,
  grey,
  red,
} from '@mui/material/colors';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CancelIcon from '@mui/icons-material/Cancel';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SellerDashboardStatistics = () => {
  const [statistics, setStatistics] = useState({});
  const [previousStatistics, setPreviousStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('daily');
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchStatistics();
    fetchSellers(); // Charger les vendeurs pour la gestion multi-vendeurs
  }, [timeFilter, selectedSeller]);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/auctions/statisticsSeller?filter=${timeFilter}${
          selectedSeller ? `&sellerId=${selectedSeller.id}` : ''
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatistics(response.data.current || {});
      setPreviousStatistics(response.data.previous || {});
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques :', error);
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
        const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/sellers'
      ,
        {
          headers: { Authorization: `Bearer ${token}` },
        });
      setSellers(response.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des vendeurs :', error);
    }
  };

  const renderComparison = (current, previous) => {
    if (current > previous) {
      return (
        <Typography sx={{ color: green[500], display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon /> +{current - previous}
        </Typography>
      );
    } else if (current < previous) {
      return (
        <Typography sx={{ color: red[500], display: 'flex', alignItems: 'center' }}>
          <TrendingDownIcon /> -{previous - current}
        </Typography>
      );
    } else {
      return <Typography sx={{ color: grey[500] }}>Stable</Typography>;
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
        backgroundColor: [blue[500], green[700], amber[500], teal[500]],
        borderColor: [blue[700], green[800], amber[700], teal[700]],
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
        <Grid item xs={12} sm={6} md={8}>
          <Autocomplete
            options={sellers}
            getOptionLabel={(option) => option.name}
            value={selectedSeller}
            onChange={(event, value) => setSelectedSeller(value)}
            renderInput={(params) => (
              <TextField {...params} label="Sélectionnez un vendeur" fullWidth />
            )}
          />
        </Grid>
      </Grid>

      {loading ? (
        <Typography align="center">Chargement des données...</Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ marginBottom: 4 }}>
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
                {renderComparison(statistics.created, previousStatistics.created)}
              </Paper>
            </Grid>
            {/* Ajoutez des cartes similaires pour annulées, en cours, stoppées, et taux de succès */}
          </Grid>

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
