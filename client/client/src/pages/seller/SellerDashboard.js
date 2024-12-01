import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddCircleOutline,
  List as ListIcon,
  Assessment,
  AccountBalanceWallet,
  Notifications,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashbord.css';
import logo from '../../assets/images/Gtoken.webp';
import CreerEnchere from './CreerEnchere';  // Importer le composant CreateAuction
import Wallet from './Wallet';
const drawerWidth = 260; // Plus large pour un meilleur design

const SellerDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('Tableau de Bord');
  const [tokenBalance, setTokenBalance] = useState(1200); // Exemple de solde initial
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate('/HomePage');
  };

  const renderGraph = () => {
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Ventes Mensuelles',
          data: [120, 150, 180, 220, 300, 350],
          backgroundColor: 'rgba(51, 98, 127, 0.2)',
          borderColor: '#33627F',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
    return <Line data={data} />;
  };

  const renderSection = () => {
    switch (selectedSection) {
      case 'Tableau de Bord':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: '#f4f6f8', boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6">Solde du Compte</Typography>
                  <Typography variant="h4" color="primary">{tokenBalance} GTC</Typography>
                  <Button variant="contained" color="primary" sx={{ marginTop: 2, borderRadius: 3 }}>
                    Retirer des Tokens
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: '#f4f6f8', boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6">Total des Ventes</Typography>
                  <Typography variant="h4" color="secondary">3200 GTC</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: '#f4f6f8', boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6">Enchères Actives</Typography>
                  <Typography variant="h4" color="error">15</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" align="center" style={{ margin: '20px 0' }}>
                Performance des Ventes
              </Typography>
              {renderGraph()}
            </Grid>
          </Grid>
        );
      case 'Solde de Compte':
        return (
          <Box>
            <Typography variant="h5" align="center">Détails du Solde</Typography>
            <Card sx={{ marginTop: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6">Solde de Tokens</Typography>
                <Typography variant="h4" color="primary" sx={{ marginTop: 2 }}>
                  {tokenBalance} GTC
                </Typography>
                <Typography variant="body2" sx={{ marginTop: 1 }}>
                  Vous pouvez retirer vos tokens ou les utiliser pour placer des enchères.
                </Typography>
                <Button variant="contained" color="primary" sx={{ marginTop: 2, borderRadius: 3 }}>
                  Demander un Retrait
                </Button>
              </CardContent>
            </Card>
          </Box>
        );
      case 'Créer Enchère':
        return <CreerEnchere />;
      case 'Portefeuille':
        return <Wallet />;  // Utilisez le composant CreateAuction ici
      case 'Mes Enchères':
        return (
          <Box>
            <Typography variant="h5" align="center">Liste de Mes Enchères</Typography>
            {/* Ajouter la liste des enchères ici */}
          </Box>
        );
      case 'Rapports de Ventes':
        return (
          <Box>
            <Typography variant="h5" align="center">Rapports de Ventes</Typography>
            {renderGraph()}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#33627F' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={logo} alt="Logo" sx={{ width: 50, height: 50, marginRight: 2 }} />
            <Typography variant="h6" sx={{ color: '#fff' }}>Tableau de Bord Vendeur</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Button variant="contained" sx={{ color: '#fff', backgroundColor: '#ff7a45', marginLeft: 2 }} onClick={handleBackButtonClick}>
              Accueil
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, mt: '64px' }}>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#F5F5F5',
              paddingTop: '16px',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <List>
            {[
              { text: 'Tableau de Bord', icon: <DashboardIcon sx={{ color: '#33627F' }} /> },
              { text: 'Solde de Compte', icon: <AccountBalanceWallet sx={{ color: '#33627F' }} /> },
              { text: 'Créer Enchère', icon: <AddCircleOutline sx={{ color: '#33627F' }} /> },
              { text: 'Mes Enchères', icon: <ListIcon sx={{ color: '#33627F' }} /> },
              { text: 'Rapports de Ventes', icon: <Assessment sx={{ color: '#33627F' }} /> },
              { text: 'Portefeuille', icon: <Assessment sx={{ color: '#33627F' }} /> },
            ].map(({ text, icon }) => (
              <ListItem
                button
                key={text}
                onClick={() => setSelectedSection(text)}
                sx={{
                  '&:hover': {
                    backgroundColor: '#33627F',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {renderSection()}
        </Box>
      </Box>
    </Box>
  );
};

export default SellerDashboard;
