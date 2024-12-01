import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '../../../src/assets/images/deconnexion.png';


import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

import UsersManagement from './UsersManagement';
import TokenManagement from './Auction/TokenManagement';
import AuctionsManagement from './Auction/AuctionsManagement';
import AuctionSettings from './Auction/AuctionSettings';
import ActiveAuctions from './Auction/ActiveAuctions';
import AuctionHistory from './Auction/AuctionHistory';
import StopAuctions from './Auction/StopAuctions';
import AutomaticBidding from './Auction/AutomaticBidding';
import AuctionCategories from './Auction/AuctionCategories';
import BidValidation from './Auction/BidValidation';
import ItemsValidation from './ItemsValidation';
import ValidateArticle from './ValidateArticle';
import TransactionsManagement from './TransactionsManagement';
import NotificationsManagement from './NotificationsManagement';
import ReportsManagement from './ReportsManagement';
import PlatformSettings from './PlatformSettings';
import PlatformBalance from './PlatformBalance';
import img from '../../../src/assets/images/Gtoken.webp';
import { blue, green, red, grey, teal, purple } from '@mui/material/colors';

const NAVIGATION = [
  { kind: 'header', title: 'Tableau de Bord' },
  { segment: 'dashboard', title: 'Dashboard', icon: <DashboardIcon sx={{ color: teal[700], fontWeight: 'bold' }} /> },
  
  { kind: 'header', title: 'Gestion des Utilisateurs' },
  { segment: 'users', title: 'Gérer les Utilisateurs', icon: <PeopleIcon /> },
  
  { kind: 'header', title: 'Gestion des Tokens' },
  { segment: 'tokens', title: 'Gérer les Tokens', icon: <MonetizationOnIcon /> },

  { kind: 'header', title: 'Gestion des Enchères' },
  { segment: 'auctions/active', title: 'Enchères Actives', icon: <GavelIcon /> },
  { segment: 'auctions/history', title: 'Historique des Enchères', icon: <GavelIcon /> },
  { segment: 'auctions/stop', title: 'Arrêt des Enchères', icon: <GavelIcon /> },
  { segment: 'auctions/automatic-bidding', title: 'Enchères Automatiques', icon: <GavelIcon /> },
  { segment: 'auctions/categories', title: 'Catégories d’Enchères', icon: <GavelIcon /> },
  { segment: 'auctions/validation', title: 'Validation des Enchères', icon: <AssignmentTurnedInIcon /> },
  { segment: 'auctions/settings', title: 'Paramètres des Enchères', icon: <SettingsIcon /> },
  
  { kind: 'header', title: 'Gestion des Articles' },
  { segment: 'items', title: 'Valider les Articles', icon: <AssignmentTurnedInIcon /> },
  { segment: 'validateitems', title: 'Valider les articles', icon: <AssignmentTurnedInIcon /> },

  { kind: 'header', title: 'Gestion des Transactions' },
  { segment: 'transactions', title: 'Transactions', icon: <MonetizationOnIcon /> },
  
  { kind: 'header', title: 'Notifications' },
  { segment: 'notifications', title: 'Notifications', icon: <NotificationsIcon /> },
  
  { kind: 'header', title: 'Analytics' },
  { segment: 'reports', title: 'Rapports', icon: <BarChartIcon /> },

  { kind: 'header', title: 'Finances' },
  { segment: 'platform-balance', title: 'Solde de la Plateforme', icon: <MonetizationOnIcon /> },


  { kind: 'header', title: 'Paramètres de la Plateforme' },
  { segment: 'settings', title: 'Paramètres', icon: <SettingsIcon /> },
];

const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

function DemoPageContent({ pathname }) {
  switch (pathname) {
    case '/users': return <UsersManagement    />;
    case '/tokens': return <TokenManagement />;
    case '/auctions': return <AuctionsManagement />;
    case '/auctions/settings': return <AuctionSettings />;
    case '/auctions/active': return <ActiveAuctions />;
    case '/auctions/history': return <AuctionHistory />;
    case '/auctions/stop': return <StopAuctions />;
    case '/auctions/automatic-bidding': return <AutomaticBidding />;
    case '/auctions/categories': return <AuctionCategories />;
    case '/auctions/validation': return <BidValidation />;
    case '/items': return <ItemsValidation />;
    case '/validateitems': return <ValidateArticle />;
    case '/transactions': return <TransactionsManagement />;
    case '/notifications': return <NotificationsManagement />;
    case '/reports': return <ReportsManagement />;
    case '/platform-balance': return <PlatformBalance />;;
    case '/settings': return <PlatformSettings />;
    default: return (
      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5">Contenu du tableau de bord pour {pathname}</Typography>
      </Box>
    );
  }
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function SuperDashboard(props) {
  const { window } = props;
  const router = useDemoRouter('/dashboard');
  const navigate = useNavigate();
  const demoWindow = window !== undefined ? window() : undefined;

  
  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprime le token
    navigate('/superadmin-login'); // Redirige vers la page de connexion
  };
  
  
  useEffect(() => {
    const titleElement = document.querySelector('.MuiTypography-h6');
    titleElement.style.color= 'teal';
   
    if (titleElement) titleElement.textContent = 'Administrateur';
  }, []);

  useEffect(() => {
    const logoElement = document.createElement('img');
    logoElement.src = img;
    logoElement.alt = 'logo';
    logoElement.style.height = '50px';
    logoElement.style.borderRadius = '50%';
    const titleElement = document.querySelector('.css-yzjoij');
    if (titleElement) {
      titleElement.innerHTML = '';
      titleElement.appendChild(logoElement);
    }
  }, []);
  
  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={demoTheme} window={demoWindow}>
      <DashboardLayout>
        <Box
          sx={{
            backgroundColor: blue[50], // couleur de fond gris foncé
            minHeight: '100vh', // hauteur complète pour couvrir tout l'écran
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px' }}>
            {/* Icône de déconnexion */}
            <IconButton color="inherit" onClick={handleLogout}>
            <img
            src={ LogoutIcon} // Utilisation de votre icône
            alt="House Icon"
            style={{ width: 30, height: 30 }} // Ajuster la taille
          />
            </IconButton>
          </Box>
          <DemoPageContent pathname={router.pathname} />
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
  
}

SuperDashboard.propTypes = {
  window: PropTypes.func,
};

export default SuperDashboard;
